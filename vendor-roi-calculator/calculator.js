(function(){
  'use strict';

  // Constants
  const ATTENDEES_PER_EVENT = 175;
  const SHOW_RATE = 0.70;
  const TRIAL_TO_PAYING_RATE = 0.60;
  const AVG_TECHS_PER_DEAL = 3;
  const AVG_SEATS_PER_DEAL = 500;
  const SEAT_DEPLOY_RATE = 0.70;

  // Event close pattern over 6 months
  const EVENT_PATTERN = [4, 3, 2, 1, 1, 0];
  const EVENT_PATTERN_TOTAL = EVENT_PATTERN.reduce((a,b) => a + b, 0);

  // Chart instances
  let funnelChart, pipelineChart;

  // Utility functions
  function boot(fn) {
    if(document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  const el = (id) => document.getElementById(id);

  function showError(msg) {
    const errEl = el("roiError");
    if(!errEl) {
      alert(msg);
      return;
    }
    errEl.textContent = msg;
    errEl.classList.remove("roi-hidden");
  }

  function clearError() {
    const errEl = el("roiError");
    if(!errEl) return;
    errEl.textContent = "";
    errEl.classList.add("roi-hidden");
  }

  function money(n) {
    if(!isFinite(n)) return "$0";
    return n.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    });
  }

  function getNumber(id) {
    const val = parseFloat(el(id).value);
    return isFinite(val) ? val : 0;
  }

  function populatePercentSelect(selectId, start, end, defaultValue) {
    const s = el(selectId);
    s.innerHTML = "";
    for(let v = start; v <= end; v++) {
      const opt = document.createElement("option");
      opt.value = String(v);
      opt.textContent = v + "%";
      if(v === defaultValue) opt.selected = true;
      s.appendChild(opt);
    }
  }

  function validateInputs() {
    const model = el("pricingModel").value;
    if(model === "per_seat" && getNumber("pricePerSeat") <= 0) {
      return "Please enter your price per seat.";
    }
    if(model === "per_org" && getNumber("pricePerOrg") <= 0) {
      return "Please enter your price per MSP organization.";
    }
    if(model === "per_tech") {
      if(getNumber("pricePerTech") <= 0) {
        return "Please enter your price per technician.";
      }
      if(getNumber("avgTechs") <= 0) {
        return "Please enter your average technicians per MSP.";
      }
    }
    return "";
  }

  function tierLevelFromValue(v) {
    if(v >= 30000) return 3;
    if(v >= 20000) return 2;
    return 1;
  }

  function clampDemoRate(r) {
    return Math.max(0.10, Math.min(0.50, r));
  }

  function scalePatternToTotal(totalDeals) {
    const len = EVENT_PATTERN.length;
    const result = Array(len).fill(0);
    if(totalDeals <= 0 || EVENT_PATTERN_TOTAL <= 0) return result;

    const raw = EVENT_PATTERN.map(v => v * totalDeals / EVENT_PATTERN_TOTAL);
    const floors = raw.map(Math.floor);
    const fracs = raw.map((v,i) => ({ idx: i, frac: v - floors[i] }));

    let sumFloors = floors.reduce((a,b) => a + b, 0);
    let remaining = totalDeals - sumFloors;

    fracs.sort((a,b) => b.frac - a.frac);

    let i = 0;
    while(remaining > 0) {
      const idx = fracs[i % fracs.length].idx;
      floors[idx] += 1;
      remaining -= 1;
      i += 1;
    }

    for(let j = 0; j < len; j++) {
      result[j] = floors[j];
    }
    return result;
  }

  // Chart management
  function ensureCharts(monthsCount) {
    if(funnelChart) funnelChart.destroy();
    if(pipelineChart) pipelineChart.destroy();

    funnelChart = new Chart(el("funnelChart"), {
      type: "bar",
      data: {
        labels: ["Attendees", "Demos scheduled", "Demos taken", "Deals closed"],
        datasets: [
          { label: "Event 1", data: [0, 0, 0, 0] }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        plugins: {
          legend: { display: true, position: "bottom" },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                return ctx.parsed.x.toLocaleString() + " " + ctx.label.toLowerCase();
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { callback: (v) => v.toLocaleString() }
          },
          y: { ticks: { autoSkip: false } }
        }
      }
    });

    const labels = Array.from({length: monthsCount}, (_,i) => "Month " + (i+1));

    pipelineChart = new Chart(el("pipelineChart"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Deals closed (across events)", data: Array(monthsCount).fill(0) }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                return ctx.parsed.y.toLocaleString() + " deals";
              }
            }
          }
        },
        scales: {
          x: { ticks: { autoSkip: false } },
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => v.toLocaleString() }
          }
        }
      }
    });
  }

  // ARR card management
  function hideArrCards() {
    el("arrOrgCard").classList.add("roi-hidden");
    el("arrTechCard").classList.add("roi-hidden");
    el("arrSeatCard").classList.add("roi-hidden");
  }

  function updateArrCard(model, data) {
    const {
      trialsClosed,
      payingCustomers,
      monthlyPrice,
      arrPerConversion,
      arrTotal,
      arrPerEvent,
      totalEventSpend,
      events
    } = data;

    const ratio = totalEventSpend > 0 ? arrTotal / totalEventSpend : 0;
    const ratioDisplay = isFinite(ratio) && ratio > 0 ? ratio.toFixed(1) : "0.0";

    if(model === "per_org") {
      el("arrOrgTrials").textContent = trialsClosed.toLocaleString();
      el("arrOrgPaying").textContent = payingCustomers.toLocaleString();
      el("arrOrgArrPerConv").textContent = money(arrPerConversion);
      el("arrOrgArrPerEvent").textContent = money(arrPerEvent);
      el("arrOrgEvents").textContent = events.toString();
      el("arrOrgArrTotal").textContent = money(arrTotal);
      el("arrOrgSpendTotal").textContent = money(totalEventSpend);
      el("arrOrgRatioText").textContent =
        "This model is projecting " + ratioDisplay + "x return on event spend.";
      el("arrOrgCard").classList.remove("roi-hidden");
    }

    if(model === "per_tech") {
      el("arrTechTrials").textContent = trialsClosed.toLocaleString();
      el("arrTechPaying").textContent = payingCustomers.toLocaleString();
      el("arrTechAvgTechs").textContent = AVG_TECHS_PER_DEAL.toString();
      el("arrTechArrPerConv").textContent = money(arrPerConversion);
      el("arrTechArrPerEvent").textContent = money(arrPerEvent);
      el("arrTechEvents").textContent = events.toString();
      el("arrTechArrTotal").textContent = money(arrTotal);
      el("arrTechSpendTotal").textContent = money(totalEventSpend);
      el("arrTechRatioText").textContent =
        "This model is projecting " + ratioDisplay + "x return on event spend.";
      el("arrTechCard").classList.remove("roi-hidden");
    }

    if(model === "per_seat") {
      el("arrSeatTrials").textContent = trialsClosed.toLocaleString();
      el("arrSeatPaying").textContent = payingCustomers.toLocaleString();
      el("arrSeatArrPerConv").textContent = money(arrPerConversion);
      el("arrSeatArrPerEvent").textContent = money(arrPerEvent);
      el("arrSeatEvents").textContent = events.toString();
      el("arrSeatArrTotal").textContent = money(arrTotal);
      el("arrSeatSpendTotal").textContent = money(totalEventSpend);
      el("arrSeatRatioText").textContent =
        "This model is projecting " + ratioDisplay + "x return on event spend.";
      el("arrSeatCard").classList.remove("roi-hidden");
    }
  }

  // UI handlers
  function setModelFields() {
    const v = el("pricingModel").value;
    el("pricePerSeatField").classList.toggle("roi-hidden", v !== "per_seat");
    el("pricePerOrgField").classList.toggle("roi-hidden", v !== "per_org");
    el("pricePerTechField").classList.toggle("roi-hidden", v !== "per_tech");
    el("avgTechsField").classList.toggle("roi-hidden", v !== "per_tech");
  }

  function updateTierVisibility() {
    const events = parseInt(el("eventCount").value, 10) || 1;
    el("tier2Wrap").classList.toggle("roi-hidden", events < 2);

    if(events === 1) {
      el("pipelineHeader").textContent = "Deal pipeline projection (6 months)";
    } else {
      el("pipelineHeader").textContent = "Deal pipeline projection across two events (12 months)";
    }
  }

  // Main calculation
  function runCalculation() {
    clearError();
    hideArrCards();

    const err = validateInputs();
    if(err) {
      showError(err);
      return;
    }

    const model = el("pricingModel").value;
    const demoRatePct = parseFloat(el("demoRatePct").value) || 0;
    const closeRatePct = parseFloat(el("closeRatePct").value) || 0;
    const baseDemoRate = demoRatePct / 100;
    const closeRate = closeRatePct / 100;

    const events = parseInt(el("eventCount").value, 10) || 1;
    const monthsCount = events === 1 ? 6 : 12;

    ensureCharts(monthsCount);

    const tier1Val = parseFloat(el("tier1").value) || 0;
    const tier2Val = events >= 2 ? (parseFloat(el("tier2").value) || 0) : 0;

    const tier1Level = tierLevelFromValue(tier1Val);
    const tier2Level = tierLevelFromValue(tier2Val);

    const demoRate1 = clampDemoRate(baseDemoRate);
    let demoRate2 = demoRate1;

    if(events >= 2) {
      const tierStepsUp = Math.max(0, tier2Level - tier1Level);
      const bump = 0.075 * tierStepsUp;
      demoRate2 = clampDemoRate(baseDemoRate + bump);
    }

    const eventCost1 = tier1Val;
    const eventCost2 = events >= 2 ? tier2Val : 0;
    const totalEventSpend = eventCost1 + eventCost2;

    const attendees = ATTENDEES_PER_EVENT;

    // Event 1
    const demosScheduled1Raw = attendees * demoRate1;
    const demosTaken1Raw = demosScheduled1Raw * SHOW_RATE;
    const dealsClosed1Raw = demosTaken1Raw * closeRate;
    const demosScheduled1 = Math.round(demosScheduled1Raw);
    const demosTaken1 = Math.round(demosTaken1Raw);
    const dealsClosed1 = Math.round(dealsClosed1Raw);

    // Event 2
    let demosScheduled2 = 0, demosTaken2 = 0, dealsClosed2 = 0;

    if(events >= 2) {
      const demosScheduled2Raw = attendees * demoRate2;
      const demosTaken2Raw = demosScheduled2Raw * SHOW_RATE;
      const dealsClosed2Raw = demosTaken2Raw * closeRate;
      demosScheduled2 = Math.round(demosScheduled2Raw);
      demosTaken2 = Math.round(demosTaken2Raw);
      dealsClosed2 = Math.round(dealsClosed2Raw);
    }

    // Update funnel chart
    const funnelLabels = ["Attendees", "Demos scheduled", "Demos taken", "Deals closed"];
    const event1Data = [attendees, demosScheduled1, demosTaken1, dealsClosed1];
    const event2Data = events >= 2 ? [attendees, demosScheduled2, demosTaken2, dealsClosed2] : [0,0,0,0];

    if(events === 1) {
      funnelChart.data.labels = funnelLabels;
      funnelChart.data.datasets = [
        { label: "Event 1", data: event1Data }
      ];
    } else {
      funnelChart.data.labels = funnelLabels;
      funnelChart.data.datasets = [
        { label: "Event 1", data: event1Data },
        { label: "Event 2", data: event2Data }
      ];
    }
    funnelChart.update();

    // Update pipeline chart
    const monthlyDeals = Array(monthsCount).fill(0);

    if(dealsClosed1 > 0) {
      const pattern1 = scalePatternToTotal(dealsClosed1);
      for(let i = 0; i < pattern1.length; i++) {
        if(i < monthsCount) {
          monthlyDeals[i] += pattern1[i];
        }
      }
    }

    if(events >= 2 && dealsClosed2 > 0) {
      const pattern2 = scalePatternToTotal(dealsClosed2);
      for(let i = 0; i < pattern2.length; i++) {
        const idx = 6 + i;
        if(idx >= 0 && idx < monthsCount) {
          monthlyDeals[idx] += pattern2[i];
        }
      }
    }

    pipelineChart.data.datasets[0].data = monthlyDeals;
    pipelineChart.update();

    // Calculate ARR
    const trialsClosed = dealsClosed1 + dealsClosed2;
    const payingCustomers = Math.round(trialsClosed * TRIAL_TO_PAYING_RATE);

    let monthlyPrice, arrPerConversion;

    if(model === "per_org") {
      monthlyPrice = getNumber("pricePerOrg");
      arrPerConversion = monthlyPrice * 12;
    } else if(model === "per_tech") {
      monthlyPrice = getNumber("pricePerTech");
      arrPerConversion = monthlyPrice * 12 * AVG_TECHS_PER_DEAL;
    } else if(model === "per_seat") {
      monthlyPrice = getNumber("pricePerSeat");
      const seatDeployments = AVG_SEATS_PER_DEAL * SEAT_DEPLOY_RATE;
      arrPerConversion = monthlyPrice * 12 * seatDeployments;
    }

    const arrTotal = arrPerConversion * payingCustomers;
    const arrPerEvent = events > 0 ? arrTotal / events : arrTotal;

    updateArrCard(model, {
      trialsClosed,
      payingCustomers,
      monthlyPrice,
      arrPerConversion,
      arrTotal,
      arrPerEvent,
      totalEventSpend,
      events
    });

    el("results").classList.remove("roi-hidden");
    el("results").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Reset function
  function reset() {
    clearError();
    hideArrCards();

    ["pricePerSeat","pricePerOrg","pricePerTech","avgTechs"].forEach(id => {
      if(el(id)) el(id).value = "";
    });

    el("pricingModel").value = "per_seat";
    setModelFields();

    populatePercentSelect("demoRatePct", 15, 30, 25);
    populatePercentSelect("closeRatePct", 10, 70, 25);

    el("eventCount").value = "1";
    updateTierVisibility();

    el("tier1").value = "7500";
    el("tier2").value = "20000";

    el("results").classList.add("roi-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Initialize
  boot(function() {
    populatePercentSelect("demoRatePct", 15, 30, 25);
    populatePercentSelect("closeRatePct", 10, 70, 25);

    el("pricingModel").addEventListener("change", setModelFields);
    el("eventCount").addEventListener("change", updateTierVisibility);
    el("runBtn").addEventListener("click", runCalculation);
    el("resetBtn").addEventListener("click", reset);

    setModelFields();
    updateTierVisibility();
  });

})();
