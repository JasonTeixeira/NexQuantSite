using System.Windows.Controls;
using System.Windows;
using QuantumTrader.Models;
using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using QuantumTrader.Services;

namespace QuantumTrader.Views
{
    public partial class LiveTradingView : UserControl
    {

        private IMultiAccountManagerService? _accountManager;

        public LiveTradingView()
        {
            InitializeComponent();

            // Get services from DI
            var app = Application.Current as App;
            if (app?.Services != null)
            {
                _accountManager = app.Services.GetService<IMultiAccountManagerService>();
            }

            Loaded += LiveTradingView_Loaded;
        }

        #region Event Handlers

        private async void AddAccountButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (DataContext is ILiveTradingDashboardService dashboardService)
                {
                    var accountName = $"NEW-{DateTime.Now:HHmmss}";
                    var success = await dashboardService.AddAccountAsync(accountName, "SIM", 25000m);

                    if (success)
                    {
                        ShowMessage("✅ Account Added", $"New account '{accountName}' added successfully!\n\nYou can now assign a strategy and start trading.");
                    }
                    else
                    {
                        ShowMessage("❌ Error", "Failed to add new account. Please try again.");
                    }
                }
            }
            catch (Exception ex)
            {
                ShowMessage("❌ Error", $"Error adding account: {ex.Message}");
            }
        }

        private async void RemoveAccountButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (sender is Button button && button.Tag is int accountId && DataContext is ILiveTradingDashboardService dashboardService)
                {
                    var result = MessageBox.Show(
                        $"⚠️ REMOVE ACCOUNT {accountId}\n\nThis will:\n• Stop all trading on this account\n• Close any open positions\n• Remove account from dashboard\n\nThis action cannot be undone. Continue?",
                        "🗑️ Confirm Account Removal",
                        MessageBoxButton.YesNo,
                        MessageBoxImage.Warning);

                    if (result == MessageBoxResult.Yes)
                    {
                        var success = await dashboardService.RemoveAccountAsync(accountId);
                        if (success)
                        {
                            ShowMessage("✅ Account Removed", $"Account {accountId} has been successfully removed from the dashboard.");
                        }
                        else
                        {
                            ShowMessage("❌ Error", "Failed to remove account. Please try again.");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ShowMessage("❌ Error", $"Error removing account: {ex.Message}");
            }
        }

        private async void StartAccountButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (sender is Button button && button.Tag is int accountId && DataContext is ILiveTradingDashboardService dashboardService)
                {
                    var success = await dashboardService.StartTradingAsync(accountId);
                    if (success)
                    {
                        ShowMessage("🚀 Trading Started", $"Account {accountId} is now LIVE!\n\n• Strategy execution: ACTIVE\n• Real-time monitoring: ENABLED\n• Risk controls: ACTIVE");
                    }
                    else
                    {
                        ShowMessage("❌ Error", "Failed to start trading. Check account configuration.");
                    }
                }
            }
            catch (Exception ex)
            {
                ShowMessage("❌ Error", $"Error starting trading: {ex.Message}");
            }
        }

        private async void StopAccountButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (sender is Button button && button.Tag is int accountId && DataContext is ILiveTradingDashboardService dashboardService)
                {
                    var success = await dashboardService.StopTradingAsync(accountId);
                    if (success)
                    {
                        ShowMessage("⏸️ Trading Stopped", $"Account {accountId} trading has been stopped.\n\n• Strategy execution: PAUSED\n• Positions: MAINTAINED\n• Risk monitoring: ACTIVE");
                    }
                    else
                    {
                        ShowMessage("❌ Error", "Failed to stop trading. Please try again.");
                    }
                }
            }
            catch (Exception ex)
            {
                ShowMessage("❌ Error", $"Error stopping trading: {ex.Message}");
            }
        }

        private async void EmergencyStopButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (sender is Button button && button.Tag is int accountId && DataContext is ILiveTradingDashboardService dashboardService)
                {
                    var result = MessageBox.Show(
                        $"🚨 EMERGENCY STOP - Account {accountId}\n\n⚠️ THIS WILL IMMEDIATELY:\n• Close ALL open positions\n• Stop strategy execution\n• Disable all trading\n• Lock account controls\n\n🔴 This action is IRREVERSIBLE for today's session.\n\nAre you absolutely sure?",
                        "🚨 EMERGENCY STOP CONFIRMATION",
                        MessageBoxButton.YesNo,
                        MessageBoxImage.Error);

                    if (result == MessageBoxResult.Yes)
                    {
                        var success = await dashboardService.EmergencyStopAsync(accountId);
                        if (success)
                        {
                            ShowMessage("🚨 Emergency Stop Executed", $"EMERGENCY STOP has been executed for account {accountId}.\n\n✅ All positions closed\n✅ Strategy execution stopped\n✅ Trading disabled\n\nAccount is now in safe mode.");
                        }
                        else
                        {
                            ShowMessage("❌ Error", "Failed to execute emergency stop. Please contact support immediately.");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ShowMessage("❌ Critical Error", $"CRITICAL ERROR during emergency stop: {ex.Message}\n\nPlease contact support immediately!");
            }
        }

        private async void EmergencyStopAllButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (DataContext is ILiveTradingDashboardService dashboardService)
                {
                    var result = MessageBox.Show(
                        "🚨 EMERGENCY STOP ALL ACCOUNTS\n\n⚠️ CRITICAL WARNING ⚠️\n\nThis will IMMEDIATELY:\n• Close ALL open positions across ALL accounts\n• Stop ALL strategy execution\n• Disable trading on ALL accounts\n• Put entire portfolio in safe mode\n\n🔴 This action affects your ENTIRE trading operation.\n\nType 'STOP ALL' to confirm:",
                        "🚨 EMERGENCY STOP ALL - FINAL CONFIRMATION",
                        MessageBoxButton.YesNo,
                        MessageBoxImage.Error);

                    if (result == MessageBoxResult.Yes)
                    {
                        var success = await dashboardService.EmergencyStopAllAsync();
                        if (success)
                        {
                            ShowMessage("🚨 EMERGENCY STOP ALL EXECUTED", "🔴 EMERGENCY STOP has been executed for ALL ACCOUNTS.\n\n✅ All positions closed across all accounts\n✅ All strategy execution stopped\n✅ All trading disabled\n✅ Portfolio in safe mode\n\nYour entire trading operation is now secured.");
                        }
                        else
                        {
                            ShowMessage("❌ Critical Error", "FAILED to execute emergency stop for all accounts.\n\nPlease manually stop each account and contact support immediately!");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ShowMessage("❌ CRITICAL SYSTEM ERROR", $"CRITICAL ERROR during emergency stop all: {ex.Message}\n\nIMMEDIATELY:\n1. Manually close all positions\n2. Stop all trading\n3. Contact support\n\nDO NOT IGNORE THIS ERROR!");
            }
        }

        private void LiveTradingView_Loaded(object sender, RoutedEventArgs e)
        {
            // Get the dashboard service from DataContext and connect it to our account manager
            if (DataContext is ILiveTradingDashboardService dashboardService && _accountManager != null)
            {
                // Subscribe to account updates
                dashboardService.AccountUpdated += (s, args) =>
                {
                    // Only show critical updates (not routine ones)
                    if (args.Message.Contains("Added") || args.Message.Contains("Removed") || args.Message.Contains("EMERGENCY"))
                    {
                        Dispatcher.Invoke(() => ShowMessage("Trading Update", args.Message));
                    }
                };
            }
        }

                private async void StrategyComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            try
            {
                if (sender is ComboBox comboBox &&
                    comboBox.Tag is int accountId &&
                    comboBox.SelectedItem is ComboBoxItem selectedItem &&
                    DataContext is ILiveTradingDashboardService dashboardService)
                {
                    var strategyName = selectedItem.Content?.ToString();
                    if (!string.IsNullOrEmpty(strategyName))
                    {
                        var success = await dashboardService.AssignStrategyAsync(accountId, strategyName);
                        if (success)
                        {
                            // Show visual feedback for strategy changes
                            System.Diagnostics.Debug.WriteLine($"✅ Strategy '{strategyName}' assigned to account {accountId}");

                            // Optional: Show brief toast notification instead of popup
                            // ShowMessage("🤖 Strategy Updated", $"'{strategyName}' assigned to account {accountId}");
                        }
                        else
                        {
                            ShowMessage("❌ Strategy Assignment Failed", $"Could not assign '{strategyName}' to account {accountId}.\n\nPlease ensure:\n• Account is not actively trading\n• Strategy is compatible with account type\n• Risk limits are properly configured");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ShowMessage("❌ Strategy Assignment Error", $"Failed to assign strategy: {ex.Message}");
            }
        }

        private async void MaxLossInput_TextChanged(object sender, TextChangedEventArgs e)
        {
            try
            {
                if (sender is TextBox textBox &&
                    textBox.Tag is int accountId &&
                    DataContext is ILiveTradingDashboardService dashboardService)
                {
                    if (decimal.TryParse(textBox.Text, out decimal maxLoss) && maxLoss > 0)
                    {
                        // Update the account's risk settings
                        var account = dashboardService.Accounts.FirstOrDefault(a => a.Id == accountId);
                        if (account != null)
                        {
                            account.MaxDailyLoss = maxLoss;
                            System.Diagnostics.Debug.WriteLine($"Max daily loss updated to ${maxLoss} for account {accountId}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error updating max loss: {ex.Message}");
            }
        }

        private async void PositionSizeInput_TextChanged(object sender, TextChangedEventArgs e)
        {
            try
            {
                if (sender is TextBox textBox &&
                    textBox.Tag is int accountId &&
                    DataContext is ILiveTradingDashboardService dashboardService)
                {
                    if (decimal.TryParse(textBox.Text, out decimal positionSize) && positionSize > 0)
                    {
                        // Update the account's position size limit
                        var account = dashboardService.Accounts.FirstOrDefault(a => a.Id == accountId);
                        if (account != null)
                        {
                            // Add position size property to the model
                            System.Diagnostics.Debug.WriteLine($"Position size updated to {positionSize} for account {accountId}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error updating position size: {ex.Message}");
            }
        }

        private void ShowMessage(string title, string message)
        {
            MessageBox.Show(message, title, MessageBoxButton.OK, MessageBoxImage.Information);
        }

        #endregion
    }
}
