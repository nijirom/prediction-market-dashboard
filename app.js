/* ============================================================
   PREDICTION MARKET IRREGULARITY TRACKER — Application Logic
   ============================================================ */

// ─── Color Palette ──────────────────────────────────────────
const COLORS = {
    indigo: '#6366f1',
    rose: '#f43f5e',
    emerald: '#10b981',
    amber: '#f59e0b',
    cyan: '#06b6d4',
    violet: '#8b5cf6',
    pink: '#ec4899',
    slate: '#64748b',
    indigoDim: 'rgba(99,102,241,0.15)',
    roseDim: 'rgba(244,63,94,0.15)',
    emeraldDim: 'rgba(16,185,129,0.15)',
    amberDim: 'rgba(245,158,11,0.15)',
    cyanDim: 'rgba(6,182,212,0.15)',
    grid: 'rgba(255,255,255,0.04)',
    gridLabel: 'rgba(255,255,255,0.35)',
};

// ─── Chart.js Global Defaults ───────────────────────────────
Chart.defaults.color = COLORS.gridLabel;
Chart.defaults.borderColor = COLORS.grid;
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyleWidth = 8;
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(22,23,31,0.95)';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.titleFont = { weight: '600', size: 12 };
Chart.defaults.plugins.tooltip.bodyFont = { size: 11 };
Chart.defaults.elements.point.radius = 3;
Chart.defaults.elements.point.hoverRadius = 6;
Chart.defaults.elements.line.tension = 0.35;
Chart.defaults.animation.duration = 1200;
Chart.defaults.animation.easing = 'easeOutQuart';

// ─── Data from the Paper ────────────────────────────────────

// Calibration curve data (implied prob vs actual win rate)
const calibrationData = {
    labels: [1,2,3,4,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,99],
    actual: [0.43,0.95,1.78,2.85,4.18,8.9,13.5,18.8,24.2,29.5,34.6,39.8,44.7,49.5,54.8,60.2,65.1,70.3,75.5,80.8,85.9,90.8,95.83,99.2],
    takerActual: [0.43,0.82,1.55,2.5,3.7,8.2,12.6,17.8,23.1,28.2,33.3,38.5,43.2,48.7,53.5,59.0,63.8,69.0,74.2,79.5,84.5,89.5,94.8,98.5],
    makerActual: [1.57,2.85,4.2,5.5,6.5,11.2,15.8,21.0,26.3,31.5,36.6,41.8,46.8,51.3,56.0,61.3,66.3,71.5,76.8,82.0,87.2,92.0,96.8,99.6],
};

// Maker-taker excess returns by price bucket
const makerTakerData = {
    labels: ['1¢','5¢','10¢','15¢','20¢','25¢','30¢','35¢','40¢','45¢','50¢','55¢','60¢','65¢','70¢','75¢','80¢','85¢','90¢','95¢','99¢'],
    takerReturn: [-57,-16.4,-11,-7.5,-6,-4.8,-3.5,-2.9,-2.3,-2.8,-2.65,-2.4,-2.0,-1.6,-1.2,-0.8,-0.5,-0.3,-0.2,-0.1,-0.05],
    makerReturn: [57,16.4,11,7.5,6,4.8,3.5,2.9,2.3,2.8,2.66,2.4,2.0,1.6,1.2,0.8,0.5,0.3,0.2,0.1,0.05],
};

// Category data
const categoryData = {
    labels: ['Finance','Politics','Sports','Crypto','Weather','Entertainment','Media','World Events'],
    takerReturn: [-0.08,-0.51,-1.11,-1.34,-1.29,-2.40,-3.64,-3.66],
    makerReturn: [0.08,0.51,1.12,1.34,1.29,2.40,3.64,3.66],
    gap: [0.17,1.02,2.23,2.69,2.57,4.79,7.28,7.32],
    trades: [4.4,4.9,43.6,6.7,4.4,1.5,0.6,0.2],
};

// YES/NO asymmetry data
const yesNoData = {
    labels: [1,2,3,5,10,15,20,30,40,50,60,70,80,90,95,99],
    yesEV: [-41,-30,-22,-16.4,-10,-6,-4,-1.5,-0.8,-1.02,-0.6,-0.3,-0.1,0.1,0.2,0.1],
    noEV: [23,16,12,8,5,3.5,2.5,1.2,0.6,0.83,0.5,0.2,0.1,-0.1,-0.15,-0.05],
};

// Temporal evolution (quarterly)
const temporalData = {
    labels: ['Q1 21','Q2 21','Q3 21','Q4 21','Q1 22','Q2 22','Q3 22','Q4 22','Q1 23','Q2 23','Q3 23','Q4 23','Q1 24','Q2 24','Q3 24','Q4 24','Q1 25','Q2 25','Q3 25'],
    gap: [-3.5,-3.2,-2.8,-2.5,-2.1,-1.8,-2.2,-2.5,-1.5,-1.0,-0.5,0.2,0.5,0.8,1.2,2.5,2.8,2.6,2.4],
    volume: [2,3,5,8,10,12,15,18,20,22,25,28,30,35,30,820,600,550,500],
};

// Flow composition data
const flowData = {
    labels: ['1-5¢','6-10¢','11-20¢','21-30¢','31-40¢','41-50¢','51-60¢','61-70¢','71-80¢','81-90¢','91-99¢'],
    takerYes: [47,43,38,34,32,31,30,29,28,26,23],
    takerNo: [20,22,25,28,30,31,32,33,34,36,43],
    makerYes: [20,22,25,28,30,31,32,33,34,36,43],
    makerNo: [43,41,38,34,32,31,30,29,28,26,23],
};

// Volume by category (for doughnut)
const volumeDistData = {
    labels: ['Sports','Politics','Crypto','Finance','Weather','Entertainment','Media','World Events'],
    values: [72,13,5,4,3,1.5,1,0.5],
    colors: [COLORS.indigo, COLORS.rose, COLORS.amber, COLORS.emerald, COLORS.cyan, COLORS.pink, COLORS.violet, COLORS.slate],
};


// ─── Chart Instances ────────────────────────────────────────
let charts = {};

function createCalibrationChart() {
    const ctx = document.getElementById('calibrationChart').getContext('2d');
    charts.calibration = new Chart(ctx, {
        type: 'line',
        data: {
            labels: calibrationData.labels,
            datasets: [
                {
                    label: 'Perfect Calibration',
                    data: calibrationData.labels,
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderDash: [6, 4],
                    borderWidth: 1.5,
                    pointRadius: 0,
                    fill: false,
                    tension: 0,
                },
                {
                    label: 'Actual Win Rate (All)',
                    data: calibrationData.actual,
                    borderColor: COLORS.indigo,
                    backgroundColor: COLORS.indigoDim,
                    borderWidth: 2.5,
                    pointBackgroundColor: COLORS.indigo,
                    fill: false,
                },
                {
                    label: 'Taker Win Rate',
                    data: calibrationData.takerActual,
                    borderColor: COLORS.rose,
                    backgroundColor: COLORS.roseDim,
                    borderWidth: 2,
                    pointBackgroundColor: COLORS.rose,
                    fill: false,
                    hidden: true,
                },
                {
                    label: 'Maker Win Rate',
                    data: calibrationData.makerActual,
                    borderColor: COLORS.emerald,
                    backgroundColor: COLORS.emeraldDim,
                    borderWidth: 2,
                    pointBackgroundColor: COLORS.emerald,
                    fill: false,
                    hidden: true,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    title: { display: true, text: 'Implied Probability (¢)', color: COLORS.gridLabel, font: { size: 11 } },
                    grid: { color: COLORS.grid },
                },
                y: {
                    title: { display: true, text: 'Actual Win Rate (%)', color: COLORS.gridLabel, font: { size: 11 } },
                    grid: { color: COLORS.grid },
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const v = ctx.parsed.y;
                            const implied = ctx.parsed.x;
                            const delta = (v - implied).toFixed(2);
                            const sign = delta >= 0 ? '+' : '';
                            return `${ctx.dataset.label}: ${v}% (${sign}${delta}pp mispricing)`;
                        }
                    }
                },
                annotation: {
                    annotations: {
                        longshotZone: {
                            type: 'box',
                            xMin: 0,
                            xMax: 5,
                            backgroundColor: 'rgba(244,63,94,0.05)',
                            borderWidth: 0,
                            label: {
                                display: true,
                                content: 'Longshot Zone',
                                position: 'start',
                                color: 'rgba(244,63,94,0.4)',
                                font: { size: 9, weight: '500' },
                            }
                        }
                    }
                }
            }
        }
    });
}

function createMakerTakerChart() {
    const ctx = document.getElementById('makerTakerChart').getContext('2d');
    charts.makerTaker = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: makerTakerData.labels,
            datasets: [
                {
                    label: 'Taker Excess Return (%)',
                    data: makerTakerData.takerReturn,
                    backgroundColor: makerTakerData.takerReturn.map(v =>
                        v < -10 ? 'rgba(244,63,94,0.8)' :
                        v < -5 ? 'rgba(244,63,94,0.6)' :
                        'rgba(244,63,94,0.4)'
                    ),
                    borderColor: COLORS.rose,
                    borderWidth: 1,
                    borderRadius: 3,
                },
                {
                    label: 'Maker Excess Return (%)',
                    data: makerTakerData.makerReturn,
                    backgroundColor: makerTakerData.makerReturn.map(v =>
                        v > 10 ? 'rgba(16,185,129,0.8)' :
                        v > 5 ? 'rgba(16,185,129,0.6)' :
                        'rgba(16,185,129,0.4)'
                    ),
                    borderColor: COLORS.emerald,
                    borderWidth: 1,
                    borderRadius: 3,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    title: { display: true, text: 'Contract Price', color: COLORS.gridLabel, font: { size: 11 } },
                    grid: { display: false },
                },
                y: {
                    title: { display: true, text: 'Excess Return (%)', color: COLORS.gridLabel, font: { size: 11 } },
                    grid: { color: COLORS.grid },
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const sign = ctx.parsed.y >= 0 ? '+' : '';
                            return `${ctx.dataset.label}: ${sign}${ctx.parsed.y}%`;
                        }
                    }
                },
                annotation: {
                    annotations: {
                        zeroLine: {
                            type: 'line',
                            yMin: 0,
                            yMax: 0,
                            borderColor: 'rgba(255,255,255,0.2)',
                            borderWidth: 1,
                            borderDash: [4, 4],
                        }
                    }
                }
            }
        }
    });
}

function createCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    // Sort by gap ascending for visual clarity
    const indices = categoryData.labels.map((_, i) => i);
    indices.sort((a, b) => categoryData.gap[a] - categoryData.gap[b]);

    const sortedLabels = indices.map(i => categoryData.labels[i]);
    const sortedGap = indices.map(i => categoryData.gap[i]);
    const sortedTrades = indices.map(i => categoryData.trades[i]);

    const barColors = sortedGap.map(g =>
        g < 1 ? COLORS.emerald :
        g < 3 ? COLORS.amber :
        g < 5 ? 'rgba(244,63,94,0.7)' :
        COLORS.rose
    );

    charts.category = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedLabels,
            datasets: [{
                label: 'Maker-Taker Gap (pp)',
                data: sortedGap,
                backgroundColor: barColors,
                borderRadius: 6,
                borderSkipped: false,
                barThickness: 28,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    title: { display: true, text: 'Gap (percentage points)', color: COLORS.gridLabel, font: { size: 11 } },
                    grid: { color: COLORS.grid },
                },
                y: {
                    grid: { display: false },
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const idx = ctx.dataIndex;
                            return `Gap: ${ctx.parsed.x}pp · ${sortedTrades[idx]}M trades`;
                        }
                    }
                }
            }
        }
    });
}

function createYesNoChart() {
    const ctx = document.getElementById('yesNoChart').getContext('2d');
    charts.yesNo = new Chart(ctx, {
        type: 'line',
        data: {
            labels: yesNoData.labels,
            datasets: [
                {
                    label: 'YES Expected Value (%)',
                    data: yesNoData.yesEV,
                    borderColor: COLORS.rose,
                    backgroundColor: 'rgba(244,63,94,0.08)',
                    borderWidth: 2.5,
                    pointBackgroundColor: COLORS.rose,
                    fill: true,
                },
                {
                    label: 'NO Expected Value (%)',
                    data: yesNoData.noEV,
                    borderColor: COLORS.emerald,
                    backgroundColor: 'rgba(16,185,129,0.08)',
                    borderWidth: 2.5,
                    pointBackgroundColor: COLORS.emerald,
                    fill: true,
                },
                {
                    label: 'Break Even',
                    data: yesNoData.labels.map(() => 0),
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderDash: [6, 4],
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    title: { display: true, text: 'Cost Basis (¢)', color: COLORS.gridLabel, font: { size: 11 } },
                    grid: { color: COLORS.grid },
                },
                y: {
                    title: { display: true, text: 'Expected Value (%)', color: COLORS.gridLabel, font: { size: 11 } },
                    grid: { color: COLORS.grid },
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            if (ctx.dataset.label === 'Break Even') return null;
                            const sign = ctx.parsed.y >= 0 ? '+' : '';
                            return `${ctx.dataset.label}: ${sign}${ctx.parsed.y}%`;
                        }
                    }
                }
            }
        }
    });
}

function createTemporalChart() {
    const ctx = document.getElementById('temporalChart').getContext('2d');
    charts.temporal = new Chart(ctx, {
        type: 'line',
        data: {
            labels: temporalData.labels,
            datasets: [
                {
                    label: 'Maker-Taker Gap (pp)',
                    data: temporalData.gap,
                    borderColor: COLORS.indigo,
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const { ctx: c, chartArea } = chart;
                        if (!chartArea) return;
                        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, 'rgba(16,185,129,0.2)');
                        gradient.addColorStop(0.5, 'rgba(99,102,241,0.05)');
                        gradient.addColorStop(1, 'rgba(244,63,94,0.2)');
                        return gradient;
                    },
                    borderWidth: 2.5,
                    pointBackgroundColor: temporalData.gap.map(v => v >= 0 ? COLORS.emerald : COLORS.rose),
                    pointRadius: 4,
                    fill: true,
                    yAxisID: 'y',
                },
                {
                    label: 'Volume ($M)',
                    data: temporalData.volume,
                    borderColor: 'rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    fill: true,
                    yAxisID: 'y1',
                    tension: 0.4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    grid: { color: COLORS.grid },
                },
                y: {
                    title: { display: true, text: 'Gap (pp)', color: COLORS.gridLabel, font: { size: 11 } },
                    grid: { color: COLORS.grid },
                    position: 'left',
                },
                y1: {
                    title: { display: true, text: 'Volume ($M)', color: COLORS.gridLabel, font: { size: 11 } },
                    grid: { display: false },
                    position: 'right',
                }
            },
            plugins: {
                annotation: {
                    annotations: {
                        electionLine: {
                            type: 'line',
                            xMin: 15,
                            xMax: 15,
                            borderColor: 'rgba(244,63,94,0.5)',
                            borderWidth: 2,
                            borderDash: [6, 3],
                            label: {
                                display: true,
                                content: '2024 Election',
                                position: 'start',
                                backgroundColor: 'rgba(244,63,94,0.15)',
                                color: COLORS.rose,
                                font: { size: 10, weight: '600' },
                                padding: 4,
                            }
                        },
                        zeroLine: {
                            type: 'line',
                            yMin: 0,
                            yMax: 0,
                            yScaleID: 'y',
                            borderColor: 'rgba(255,255,255,0.15)',
                            borderWidth: 1,
                            borderDash: [4, 4],
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            if (ctx.datasetIndex === 0) {
                                const sign = ctx.parsed.y >= 0 ? '+' : '';
                                return `Gap: ${sign}${ctx.parsed.y}pp`;
                            }
                            return `Volume: $${ctx.parsed.y}M`;
                        }
                    }
                }
            }
        }
    });
}

function createFlowChart() {
    const ctx = document.getElementById('flowChart').getContext('2d');
    charts.flow = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: flowData.labels,
            datasets: [
                {
                    label: 'Taker buys YES (%)',
                    data: flowData.takerYes,
                    backgroundColor: 'rgba(244,63,94,0.7)',
                    borderColor: COLORS.rose,
                    borderWidth: 1,
                    borderRadius: 3,
                    stack: 'taker',
                },
                {
                    label: 'Taker buys NO (%)',
                    data: flowData.takerNo,
                    backgroundColor: 'rgba(244,63,94,0.3)',
                    borderColor: 'rgba(244,63,94,0.5)',
                    borderWidth: 1,
                    borderRadius: 3,
                    stack: 'taker',
                },
                {
                    label: 'Maker buys YES (%)',
                    data: flowData.makerYes,
                    backgroundColor: 'rgba(16,185,129,0.3)',
                    borderColor: 'rgba(16,185,129,0.5)',
                    borderWidth: 1,
                    borderRadius: 3,
                    stack: 'maker',
                },
                {
                    label: 'Maker buys NO (%)',
                    data: flowData.makerNo,
                    backgroundColor: 'rgba(16,185,129,0.7)',
                    borderColor: COLORS.emerald,
                    borderWidth: 1,
                    borderRadius: 3,
                    stack: 'maker',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    title: { display: true, text: 'Price Range', color: COLORS.gridLabel, font: { size: 11 } },
                    grid: { display: false },
                },
                y: {
                    title: { display: true, text: 'Volume Share (%)', color: COLORS.gridLabel, font: { size: 11 } },
                    grid: { color: COLORS.grid },
                    stacked: true,
                }
            },
        }
    });
}

function createVolumeChart() {
    const ctx = document.getElementById('volumeChart').getContext('2d');
    charts.volume = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: volumeDistData.labels,
            datasets: [{
                data: volumeDistData.values,
                backgroundColor: volumeDistData.colors.map(c => c + 'cc'),
                borderColor: volumeDistData.colors,
                borderWidth: 2,
                hoverOffset: 12,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 12,
                        font: { size: 11 },
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.label}: ${ctx.parsed}% of volume`,
                    }
                }
            }
        }
    });
}

// ─── Chart Filter Controls ──────────────────────────────────
document.querySelectorAll('.ctrl-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const chartKey = this.dataset.chart;
        const view = this.dataset.view;

        // Update active state
        this.parentElement.querySelectorAll('.ctrl-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        if (chartKey === 'calibration') {
            const chart = charts.calibration;
            if (view === 'all') {
                chart.data.datasets[1].hidden = false;
                chart.data.datasets[2].hidden = true;
                chart.data.datasets[3].hidden = true;
            } else if (view === 'taker') {
                chart.data.datasets[1].hidden = true;
                chart.data.datasets[2].hidden = false;
                chart.data.datasets[3].hidden = true;
            } else if (view === 'maker') {
                chart.data.datasets[1].hidden = true;
                chart.data.datasets[2].hidden = true;
                chart.data.datasets[3].hidden = false;
            }
            chart.update();
        }
    });
});

// ─── Live Anomaly Feed Simulation ───────────────────────────
const anomalyTemplates = [
    { severity: 'high', text: 'Longshot mispricing detected: {price}¢ contract win rate {rate}% vs implied {implied}% ({delta}pp deviation)', categories: ['Sports','Entertainment','Crypto'] },
    { severity: 'high', text: 'Extreme taker loss cluster: {count} consecutive losing YES trades at {price}¢ in {category}', categories: ['Sports','Media','World Events'] },
    { severity: 'medium', text: 'Maker-taker gap widening: {category} gap now {gap}pp, up {change}pp from 30-day average', categories: ['Sports','Crypto','Weather','Entertainment'] },
    { severity: 'medium', text: 'Optimism tax spike: YES taker volume at {percent}% in {category} {price}¢ contracts', categories: ['Sports','Politics','Entertainment'] },
    { severity: 'low', text: 'Calibration drift: {price}¢ contracts showing {delta}pp deviation from expected win rate', categories: ['Finance','Politics','Weather'] },
    { severity: 'low', text: 'Flow imbalance: taker YES/NO ratio at {ratio}:1 in {category} longshot bucket', categories: ['Sports','Crypto','Media'] },
    { severity: 'high', text: 'Wealth transfer alert: estimated ${amount}K transferred from takers to makers in past hour ({category})', categories: ['Sports','Politics','Crypto'] },
    { severity: 'medium', text: 'New maker entry detected: spread tightening in {category} from {old}¢ to {new}¢', categories: ['Finance','Politics','Sports'] },
    { severity: 'high', text: 'YES/NO asymmetry alert: {category} showing {gap}pp EV divergence at {price}¢', categories: ['Sports','Entertainment','Crypto','Media'] },
    { severity: 'low', text: 'Volume anomaly: {category} trading {mult}x average daily volume', categories: ['Politics','Sports','World Events'] },
    { severity: 'medium', text: 'Longshot accumulation: {count} large YES orders at {price}¢ in {category} — pattern matches retail surge', categories: ['Sports','Entertainment','Crypto'] },
    { severity: 'high', text: 'Record gap: {category} maker-taker spread reached {gap}pp — highest in dataset history', categories: ['Media','World Events','Entertainment'] },
];

let anomalyCount = 0;

function generateAnomaly() {
    const template = anomalyTemplates[Math.floor(Math.random() * anomalyTemplates.length)];
    const category = template.categories[Math.floor(Math.random() * template.categories.length)];
    const price = Math.floor(Math.random() * 15) + 1;
    const implied = price;
    const rate = Math.max(0.1, (price * (0.4 + Math.random() * 0.5))).toFixed(1);
    const delta = (rate - implied).toFixed(1);

    let text = template.text
        .replace('{price}', price)
        .replace('{rate}', rate)
        .replace('{implied}', implied)
        .replace('{delta}', Math.abs(delta).toFixed(1))
        .replace('{category}', category)
        .replace('{count}', Math.floor(Math.random() * 50) + 10)
        .replace('{gap}', (Math.random() * 8 + 1).toFixed(2))
        .replace('{change}', (Math.random() * 2 + 0.1).toFixed(2))
        .replace('{percent}', Math.floor(Math.random() * 20 + 35))
        .replace('{ratio}', (Math.random() * 2 + 1.5).toFixed(1))
        .replace('{amount}', Math.floor(Math.random() * 500 + 50))
        .replace('{old}', Math.floor(Math.random() * 3 + 3))
        .replace('{new}', Math.floor(Math.random() * 2 + 1))
        .replace('{mult}', (Math.random() * 4 + 1.5).toFixed(1));

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return {
        severity: template.severity,
        text,
        time: timeStr,
        category,
    };
}

function addAnomalyToFeed(anomaly) {
    const feed = document.getElementById('anomaly-feed');
    const item = document.createElement('div');
    item.className = `anomaly-item severity-${anomaly.severity}`;
    item.innerHTML = `
        <span class="anomaly-time">${anomaly.time}</span>
        <span class="anomaly-badge">${anomaly.severity}</span>
        <span class="anomaly-text">${anomaly.text}</span>
        <span class="anomaly-category">${anomaly.category}</span>
    `;

    feed.insertBefore(item, feed.firstChild);
    anomalyCount++;
    document.getElementById('anomaly-count').textContent = anomalyCount;

    // Keep max 50 items
    while (feed.children.length > 50) {
        feed.removeChild(feed.lastChild);
    }
}

// ─── Animated KPI Counter ───────────────────────────────────
function animateTradeCounter() {
    const el = document.getElementById('trade-counter');
    let current = 72100000;
    setInterval(() => {
        current += Math.floor(Math.random() * 300 + 50);
        el.textContent = current.toLocaleString();
    }, 2000);
}

// ─── Alert Banner Rotation ──────────────────────────────────
const alertMessages = [
    'Anomaly detected: Entertainment category showing 4.79pp maker-taker gap — 28x Finance baseline',
    'Longshot bias alert: 1¢ contracts win only 0.43% of the time — 57% below implied probability',
    'Optimism tax active: YES contracts returning -1.02% vs NO at +0.83% — 1.85pp structural gap',
    'Wealth transfer: Makers earning +1.12% average excess return at taker expense across all price levels',
    'Post-election shift: Maker-taker gap swung 5.3pp as professional liquidity entered the market',
    'Category alert: World Events showing 7.32pp gap — highest extraction rate across all categories',
];
let currentAlert = 0;

function rotateAlert() {
    const el = document.getElementById('alert-text');
    const banner = document.getElementById('alert-banner');
    if (banner.classList.contains('hidden')) return;

    currentAlert = (currentAlert + 1) % alertMessages.length;
    el.style.opacity = 0;
    setTimeout(() => {
        el.textContent = alertMessages[currentAlert];
        el.style.opacity = 1;
    }, 300);
}

function dismissAlert() {
    document.getElementById('alert-banner').classList.add('hidden');
}

// ─── Initialize Everything ──────────────────────────────────
function init() {
    // Create all charts
    createCalibrationChart();
    createMakerTakerChart();
    createCategoryChart();
    createYesNoChart();
    createTemporalChart();
    createFlowChart();
    createVolumeChart();

    // Start live simulation
    animateTradeCounter();

    // Add initial anomalies
    for (let i = 0; i < 8; i++) {
        setTimeout(() => addAnomalyToFeed(generateAnomaly()), i * 200);
    }

    // Continue adding anomalies
    setInterval(() => addAnomalyToFeed(generateAnomaly()), 3500);

    // Rotate alerts
    setInterval(rotateAlert, 8000);
}

// Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
