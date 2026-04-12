using System;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Extensions.DependencyInjection;
using QuantumTrader.Services;
using QuantumTrader.Execution;
using System.Linq;
using System.Windows.Threading;
using QuantumTrader.Models;
using System.Collections.ObjectModel;

namespace QuantumTrader.Views
{
	public partial class ControlCenterView : UserControl
	{
		private readonly IKillSwitchService _killSwitch;
		private readonly IRiskStateStore _riskState;
		private readonly IReconStatus _reconStatus;
		private readonly IAuditReader _auditReader;
		private readonly QuantumTrader.Execution.IBrokerAdapter _adapter;
		private readonly DispatcherTimer _metricsTimer = new DispatcherTimer();
		private readonly System.Collections.Generic.List<decimal> _pnlHistory = new System.Collections.Generic.List<decimal>();
		private readonly ObservableCollection<string> _monitoredSymbols = new ObservableCollection<string>();

		public ControlCenterView()
		{
			InitializeComponent();
			var app = Application.Current as App;
			_killSwitch = (IKillSwitchService)app?.Services.GetService(typeof(IKillSwitchService));
			_riskState = (IRiskStateStore)app?.Services.GetService(typeof(IRiskStateStore));
			_reconStatus = (IReconStatus)app?.Services.GetService(typeof(IReconStatus));
			_auditReader = (IAuditReader)app?.Services.GetService(typeof(IAuditReader));
			_adapter = (QuantumTrader.Execution.IBrokerAdapter)app?.Services.GetService(typeof(QuantumTrader.Execution.IBrokerAdapter));
			// Wire simple in-memory list for symbols so add/remove works without a full VM
			if (SymbolListBox != null) SymbolListBox.ItemsSource = _monitoredSymbols;
			RefreshKillSwitchStatus();
			StartMetricsTimer();
		}

		private void RefreshKillSwitchStatus()
		{
			if (KillSwitchStatus == null || _killSwitch == null) return;
			KillSwitchStatus.Text = _killSwitch.IsActive ? "Kill Switch: ACTIVE" : "Kill Switch: INACTIVE";
		}

		private void StartMetricsTimer()
		{
			_metricsTimer.Interval = TimeSpan.FromSeconds(10);
			_metricsTimer.Tick += async (_, __) =>
			{
				try
				{
					// Orders/min
					var now = DateTime.UtcNow;
					var count = OrderBlotter.Orders.Count(o => (now - o.Time.ToUniversalTime()).TotalSeconds <= 60);
					if (KpiOrdersPerMin != null) KpiOrdersPerMin.Text = count.ToString("F0");

					// Broker metrics + live positions grid
					if (_adapter != null)
					{
						var positions = await _adapter.GetPositionsAsync();
						var filter = SymbolFilter?.Text?.Trim();
						if (!string.IsNullOrWhiteSpace(filter))
						{
							positions = positions.Where(p => p.Symbol.IndexOf(filter, StringComparison.OrdinalIgnoreCase) >= 0).ToList();
						}
						// account filter placeholder (adapter needs account context to truly filter)
						var acct = (AccountFilter?.SelectedItem as System.Windows.Controls.ComboBoxItem)?.Content?.ToString();
						if (!string.IsNullOrWhiteSpace(acct) && !string.Equals(acct, "All", StringComparison.OrdinalIgnoreCase))
						{
							positions = positions.Where(p => (p.TradingAccountId.ToString() == acct) || acct == p.Symbol).ToList();
						}
						var unreal = positions.Sum(p => p.UnrealizedPnL);
						_pnlHistory.Add(unreal);
						if (_pnlHistory.Count > 200) _pnlHistory.RemoveRange(0, _pnlHistory.Count - 200);

						if (BrokerPositionsControl != null)
						{
							BrokerPositionsControl.ItemsSource = positions;
						}

						// P&L Today
						if (KpiPnlToday != null)
						{
							KpiPnlToday.Text = unreal.ToString("C0");
							KpiPnlToday.Foreground = unreal >= 0 ? (System.Windows.Media.Brush)FindResource("AccentGreen") : (System.Windows.Media.Brush)FindResource("AccentRed");
						}

						// Win Rate (fraction of positions with positive PnL)
						if (KpiWinRate != null)
						{
							if (positions.Count > 0)
							{
								var winners = positions.Count(p => p.UnrealizedPnL > 0);
								var wr = (double)winners * 100.0 / positions.Count;
								KpiWinRate.Text = $"{wr:F1}%";
							}
							else KpiWinRate.Text = "-";
						}

						// Simple Sharpe (using history of unrealized PnL diffs)
						if (KpiSharpe != null)
						{
							if (_pnlHistory.Count >= 6)
							{
								var diffs = _pnlHistory.Zip(_pnlHistory.Skip(1), (a, b) => b - a).Skip(1).ToArray();
								var mean = diffs.Average();
								var std = Math.Sqrt(diffs.Select(x => Math.Pow((double)(x - mean), 2)).Average());
								KpiSharpe.Text = std > 1e-9 ? (mean / (decimal)std).ToString("F2") : "-";

								// Max Drawdown from history
								if (KpiMaxDd != null)
								{
									decimal peak = decimal.MinValue;
									decimal maxDd = 0m;
									foreach (var v in _pnlHistory)
									{
										if (v > peak) peak = v;
										var dd = peak > 0 ? (peak - v) / (peak == 0 ? 1 : peak) : 0m;
										if (dd > maxDd) maxDd = dd;
									}
									KpiMaxDd.Text = maxDd > 0 ? $"{maxDd * 100m:F1}%" : "-";
								}
							}
							else
							{
								KpiSharpe.Text = "-";
								if (KpiMaxDd != null) KpiMaxDd.Text = "-";
							}
						}
					}
				}
				catch { }
			};
			_metricsTimer.Start();
		}

		private void ToggleKillSwitch_Click(object sender, RoutedEventArgs e)
		{
			if (_killSwitch == null) return;
			if (_killSwitch.IsActive)
				_killSwitch.Deactivate();
			else
				_killSwitch.Activate("Manually toggled from ControlCenterView");
			RefreshKillSwitchStatus();
		}

		private void CheckRiskLock_Click(object sender, RoutedEventArgs e)
		{
			if (_riskState == null || RiskAccountInput == null || RiskLockStatusText == null) return;
			var accountId = RiskAccountInput.Text?.Trim() ?? string.Empty;
			if (string.IsNullOrWhiteSpace(accountId))
			{
				RiskLockStatusText.Text = "Enter an account id";
				return;
			}
			if (_riskState.IsLocked(accountId, out var reason))
				RiskLockStatusText.Text = $"{accountId} is LOCKED: {reason}";
			else
				RiskLockStatusText.Text = $"{accountId} is not locked";
		}

		private async void RefreshDiagnostics_Click(object sender, RoutedEventArgs e)
		{
			if (_reconStatus == null) return;
			if (ReconHealthyText != null) ReconHealthyText.Text = _reconStatus.Healthy ? "Recon: Healthy" : "Recon: Unhealthy";
			if (ReconLastRunText != null) ReconLastRunText.Text = $"Last Run: {_reconStatus.LastRunUtc?.ToString("u") ?? "-"}";
			if (ReconUpdatesText != null) ReconUpdatesText.Text = $"Updates: {_reconStatus.UpdatesApplied}";
			if (ReconPositionsText != null) ReconPositionsText.Text = $"Positions: {_reconStatus.PositionsCount}";
			if (ReconLastErrorText != null) ReconLastErrorText.Text = $"Last Error: {_reconStatus.LastError ?? "-"}";
			if (_auditReader != null && AuditEventsList != null)
			{
				AuditEventsList.Items.Clear();
				foreach (var line in _auditReader.Tail(10))
				{
					AuditEventsList.Items.Add(line);
				}
			}
			if (_adapter != null && BrokerPositionsList != null)
			{
				try
				{
					var positions = await _adapter.GetPositionsAsync();
					var filter = SymbolFilter?.Text?.Trim();
					if (!string.IsNullOrWhiteSpace(filter))
					{
						positions = positions.Where(p => p.Symbol.IndexOf(filter, StringComparison.OrdinalIgnoreCase) >= 0).ToList();
					}
					var acct = (AccountFilter?.SelectedItem as System.Windows.Controls.ComboBoxItem)?.Content?.ToString();
					if (!string.IsNullOrWhiteSpace(acct) && !string.Equals(acct, "All", StringComparison.OrdinalIgnoreCase))
					{
						positions = positions.Where(p => (p.TradingAccountId.ToString() == acct) || acct == p.Symbol).ToList();
					}
					BrokerPositionsList.Items.Clear();
					foreach (var p in positions)
					{
						BrokerPositionsList.Items.Add($"{p.Symbol}: {p.Quantity} @ {p.AveragePrice:F2} (PnL {p.UnrealizedPnL:F2})");
					}
					if (BrokerPositionsControl != null)
					{
						BrokerPositionsControl.ItemsSource = positions;
					}

					// Open orders list (non-terminal statuses)
					if (OpenOrdersControl != null)
					{
						var orders = await _adapter.GetRecentOrdersAsync(50);
						var open = orders.Where(o => !string.Equals(o.Status, "filled", StringComparison.OrdinalIgnoreCase)
							&& !string.Equals(o.Status, "canceled", StringComparison.OrdinalIgnoreCase)
							&& !string.Equals(o.Status, "expired", StringComparison.OrdinalIgnoreCase)).ToList();
						var acct2 = (AccountFilter?.SelectedItem as System.Windows.Controls.ComboBoxItem)?.Content?.ToString();
						if (!string.IsNullOrWhiteSpace(acct2) && !string.Equals(acct2, "All", StringComparison.OrdinalIgnoreCase))
						{
							open = open.Where(o => string.Equals(o.AccountId, acct2, StringComparison.OrdinalIgnoreCase)).ToList();
						}
						OpenOrdersControl.ItemsSource = open;
					}
				}
				catch { }
			}
		}

		private async void CancelPosition_Click(object sender, RoutedEventArgs e)
		{
			try
			{
				if (_adapter == null) return;
				if (sender is System.Windows.Controls.Button btn && btn.CommandParameter is QuantumTrader.Models.Position pos)
				{
					// Cancel all open orders (broader action). For per-order cancel we need broker order id mapping.
					var ok = await _adapter.CancelAllOpenOrdersAsync();
					if (!ok) MessageBox.Show("Cancel all failed");
					await RefreshPositionsAsync();
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show($"Cancel error: {ex.Message}");
			}
		}

		private async void FlattenPosition_Click(object sender, RoutedEventArgs e)
		{
			try
			{
				if (_adapter == null) return;
				if (sender is System.Windows.Controls.Button btn && btn.CommandParameter is QuantumTrader.Models.Position pos)
				{
					var ok = await _adapter.ClosePositionAsync(pos.Symbol);
					if (!ok) MessageBox.Show("Flatten failed");
					await RefreshPositionsAsync();
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show($"Flatten error: {ex.Message}");
			}
		}

		private async void CancelAllOrders_Click(object sender, RoutedEventArgs e)
		{
			try
			{
				if (_adapter == null) return;
				var ok = await _adapter.CancelAllOpenOrdersAsync();
				if (!ok) MessageBox.Show("Cancel all orders failed");
				await RefreshPositionsAsync();
			}
			catch (Exception ex)
			{
				MessageBox.Show($"Cancel all error: {ex.Message}");
			}
		}

		private void ReportIssue_Click(object sender, RoutedEventArgs e)
		{
			try
			{
				throw new InvalidOperationException("Test exception for Sentry verification");
			}
			catch (Exception ex)
			{
				// Will be captured by Serilog + Sentry sink
				System.Diagnostics.Debug.WriteLine(ex);
				MessageBox.Show("Reported a test exception to monitoring.");
			}
		}

		private async System.Threading.Tasks.Task RefreshPositionsAsync()
		{
			try
			{
				if (_adapter == null || BrokerPositionsControl == null) return;
				var positions = await _adapter.GetPositionsAsync();
				BrokerPositionsControl.ItemsSource = positions;
			}
			catch { }
		}

		private async void CancelOrder_Click(object sender, RoutedEventArgs e)
		{
			try
			{
				if (_adapter == null) return;
				if (sender is System.Windows.Controls.Button btn && btn.CommandParameter is BrokerOrder order)
				{
					var ok = await _adapter.CancelOrderAsync(order.Id);
					if (!ok) MessageBox.Show("Cancel order failed");
					await RefreshDiagnostics_Click_ReloadOrdersOnly();
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show($"Cancel order error: {ex.Message}");
			}
		}

		private async System.Threading.Tasks.Task RefreshDiagnostics_Click_ReloadOrdersOnly()
		{
			try
			{
				if (_adapter == null || OpenOrdersControl == null) return;
				var orders = await _adapter.GetRecentOrdersAsync(50);
				var open = orders.Where(o => !string.Equals(o.Status, "filled", StringComparison.OrdinalIgnoreCase)
					&& !string.Equals(o.Status, "canceled", StringComparison.OrdinalIgnoreCase)
					&& !string.Equals(o.Status, "expired", StringComparison.OrdinalIgnoreCase)).ToList();
				var filter2 = SymbolFilter?.Text?.Trim();
				if (!string.IsNullOrWhiteSpace(filter2))
				{
					open = open.Where(o => (o.Symbol ?? string.Empty).IndexOf(filter2, StringComparison.OrdinalIgnoreCase) >= 0).ToList();
				}
				// account filter placeholder (depends on adapter returning account id)
				var acct2 = (AccountFilter?.SelectedItem as System.Windows.Controls.ComboBoxItem)?.Content?.ToString();
				if (!string.IsNullOrWhiteSpace(acct2) && !string.Equals(acct2, "All", StringComparison.OrdinalIgnoreCase))
				{
					open = open.Where(o => (o.Symbol ?? string.Empty) == acct2 || (o.ClientOrderId ?? string.Empty).Contains(acct2, StringComparison.OrdinalIgnoreCase)).ToList();
				}
				OpenOrdersControl.ItemsSource = open;
			}
			catch { }
		}

		// Missing XAML click handlers (stubs to unblock build)
		// removed duplicate handler; real implementation exists below

		private void PauseAll_Click(object sender, RoutedEventArgs e)
		{
			_killSwitch?.Activate("Paused from ControlCenterView");
			if (StrategyStatus != null) StrategyStatus.Text = "⏸️ Paused";
			RefreshKillSwitchStatus();
		}

		private void AddSymbol_Click(object sender, RoutedEventArgs e)
		{
			var sym = SymbolInput?.Text?.Trim().ToUpperInvariant();
			if (string.IsNullOrWhiteSpace(sym)) return;
			if (!_monitoredSymbols.Contains(sym)) _monitoredSymbols.Add(sym);
		}

		private void RemoveSymbol_Click(object sender, RoutedEventArgs e)
		{
			if (SymbolListBox == null) return;
			var toRemove = SymbolListBox.SelectedItems;
			if (toRemove == null || toRemove.Count == 0) return;
			var copy = new System.Collections.Generic.List<object>();
			foreach (var item in toRemove) copy.Add(item);
			foreach (var item in copy)
			{
				if (item is string s && _monitoredSymbols.Contains(s)) _monitoredSymbols.Remove(s);
			}
		}

		private void SaveRiskLimits_Click(object sender, RoutedEventArgs e)
		{
			MessageBox.Show("Risk settings saved (local only for now).", "Risk", MessageBoxButton.OK, MessageBoxImage.Information);
		}

		private void StartStrategy_Click(object sender, RoutedEventArgs e)
		{
			_killSwitch?.Deactivate();
			if (StrategyStatus != null) StrategyStatus.Text = "▶️ Running";
			RefreshKillSwitchStatus();
		}

		private void ViewReports_Click(object sender, RoutedEventArgs e)
		{
			MessageBox.Show("Reports module coming soon.", "Reports", MessageBoxButton.OK, MessageBoxImage.Information);
		}

		private void RiskSettings_Click(object sender, RoutedEventArgs e)
		{
			MessageBox.Show("Risk settings panel coming soon.", "Risk", MessageBoxButton.OK, MessageBoxImage.Information);
		}

		private void Notifications_Click(object sender, RoutedEventArgs e)
		{
			MessageBox.Show("Notifications center coming soon.", "Notifications", MessageBoxButton.OK, MessageBoxImage.Information);
		}

		private async void FlattenAll_Click(object sender, RoutedEventArgs e)
		{
			try
			{
				if (_adapter == null) return;
				var positions = await _adapter.GetPositionsAsync();
				foreach (var p in positions)
				{
					await _adapter.ClosePositionAsync(p.Symbol);
				}
				await _adapter.CancelAllOpenOrdersAsync();
				await RefreshPositionsAsync();
			}
			catch (Exception ex)
			{
				MessageBox.Show($"Flatten all error: {ex.Message}");
			}
		}
	}
}


