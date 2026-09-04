import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np

# 연도별 금/은 연평균 가격 (USD/troy oz, 실제 역사적 데이터 기반)
years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]

gold_prices = [1160, 1251, 1257, 1268, 1393, 1770, 1799, 1800, 1941, 2300, 3250]
silver_prices = [15.7, 17.1, 17.0, 15.7, 16.2, 21.4, 25.1, 21.7, 23.4, 27.5, 32.5]

fig, ax1 = plt.subplots(figsize=(13, 7))
fig.patch.set_facecolor('#1a1a2e')
ax1.set_facecolor('#16213e')

color_gold = '#FFD700'
ax1.plot(years, gold_prices, color=color_gold, linewidth=2.5, marker='o',
         markersize=6, label='Gold (left axis)', zorder=3)
ax1.fill_between(years, gold_prices, alpha=0.15, color=color_gold)
ax1.set_ylabel('Gold Price (USD / troy oz)', color=color_gold, fontsize=12)
ax1.tick_params(axis='y', labelcolor=color_gold)
ax1.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${x:,.0f}'))

ax2 = ax1.twinx()
color_silver = '#C0C0C0'
ax2.plot(years, silver_prices, color=color_silver, linewidth=2.5, marker='s',
         markersize=6, linestyle='--', label='Silver (right axis)', zorder=3)
ax2.fill_between(years, silver_prices, alpha=0.10, color=color_silver)
ax2.set_ylabel('Silver Price (USD / troy oz)', color=color_silver, fontsize=12)
ax2.tick_params(axis='y', labelcolor=color_silver)
ax2.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'${x:.1f}'))

events = {
    2020: ('COVID-19 Pandemic\nGold all-time high', 0.92),
    2022: ('Russia-Ukraine War\nInflation surge', 0.55),
    2025: ('May 2025', 0.88),
}
for yr, (label, yrel) in events.items():
    xidx = years.index(yr)
    ax1.axvline(x=yr, color='white', alpha=0.2, linestyle=':', linewidth=1)
    ax1.annotate(label,
                 xy=(yr, gold_prices[xidx]),
                 xytext=(yr - 0.35, gold_prices[xidx] * yrel),
                 fontsize=8, color='white', alpha=0.85,
                 arrowprops=dict(arrowstyle='->', color='white', alpha=0.5))

ax1.set_xticks(years)
ax1.set_xticklabels([str(y) for y in years], color='white', fontsize=10)
ax1.tick_params(axis='x', colors='white')

ax1.grid(axis='y', color='white', alpha=0.08, linestyle='--')
ax1.set_xlim(2014.5, 2025.5)

plt.title('Gold vs Silver Price Trend (2015-2025)', color='white',
          fontsize=16, fontweight='bold', pad=18)

lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
legend = ax1.legend(lines1 + lines2, labels1 + labels2,
                    loc='upper left', facecolor='#0f3460',
                    edgecolor='white', labelcolor='white', fontsize=11)

fig.text(0.99, 0.01, 'Source: Historical annual average market prices (2025: as of May)',
         ha='right', va='bottom', color='gray', fontsize=8)

plt.tight_layout()
plt.savefig('/home/user/test/gold_silver_10yr.png', dpi=150, bbox_inches='tight',
            facecolor=fig.get_facecolor())
print("저장 완료")
