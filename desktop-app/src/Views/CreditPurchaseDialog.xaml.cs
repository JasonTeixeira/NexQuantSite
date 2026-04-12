using System;
using System.Windows;
using System.Windows.Controls;
using QuantumTrader.Services;

namespace QuantumTrader.Views
{
    public partial class CreditPurchaseDialog : Window
    {
        private readonly CreditSystemService _creditService;
        private decimal _selectedAmount = 0;
        private decimal _selectedCredits = 0;

        public CreditPurchaseDialog(CreditSystemService creditService = null)
        {
            InitializeComponent();
            _creditService = creditService ?? new CreditSystemService();
            LoadCurrentBalance();
            UpdateCustomAmountPreview();
        }

        private void LoadCurrentBalance()
        {
            var currentBalance = _creditService.GetAvailableCredits();
            CurrentBalanceText.Text = $"${currentBalance:F2}";
        }

        private void UpdateCustomAmountPreview()
        {
            if (decimal.TryParse(CustomAmountInput.Text, out decimal amount))
            {
                _selectedAmount = amount;
                _selectedCredits = CalculateCredits(amount);
                CustomAmountPreview.Text = $"You'll receive: {_selectedCredits} Credits";
            }
        }

        private decimal CalculateCredits(decimal amount)
        {
            // Base rate: $1 = 1 credit
            decimal baseCredits = amount;

            // Bonus credits for larger purchases
            if (amount >= 500)
                baseCredits += amount * 0.5m; // 50% bonus
            else if (amount >= 200)
                baseCredits += amount * 0.2m; // 20% bonus
            else if (amount >= 100)
                baseCredits += amount * 0.1m; // 10% bonus

            return Math.Round(baseCredits, 0);
        }

        private void StarterPackage_Click(object sender, RoutedEventArgs e)
        {
            _selectedAmount = 50.00m;
            _selectedCredits = 50;
            ShowPaymentConfirmation();
        }

        private void ProfessionalPackage_Click(object sender, RoutedEventArgs e)
        {
            _selectedAmount = 200.00m;
            _selectedCredits = 250; // Includes 20% bonus
            ShowPaymentConfirmation();
        }

        private void EnterprisePackage_Click(object sender, RoutedEventArgs e)
        {
            _selectedAmount = 500.00m;
            _selectedCredits = 750; // Includes 50% bonus
            ShowPaymentConfirmation();
        }

        private void CustomAmount_Click(object sender, RoutedEventArgs e)
        {
            UpdateCustomAmountPreview();
            if (_selectedAmount > 0)
            {
                ShowPaymentConfirmation();
            }
            else
            {
                MessageBox.Show("Please enter a valid amount.", "Invalid Amount",
                    MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        private void ShowPaymentConfirmation()
        {
            var result = MessageBox.Show(
                $"Purchase {_selectedCredits} credits for ${_selectedAmount:F2}?\n\n" +
                $"Payment Method: {GetSelectedPaymentMethod()}\n" +
                "This will be processed securely.",
                "Confirm Purchase",
                MessageBoxButton.YesNo,
                MessageBoxImage.Question);

            if (result == MessageBoxResult.Yes)
            {
                ProcessPayment();
            }
        }

        private string GetSelectedPaymentMethod()
        {
            if (StripeRadio.IsChecked == true)
                return "Credit Card (Stripe)";
            else if (PayPalRadio.IsChecked == true)
                return "PayPal";
            else if (CryptoRadio.IsChecked == true)
                return "Cryptocurrency";
            else
                return "Credit Card (Stripe)";
        }

        private async void ProcessPayment()
        {
            try
            {
                // Show processing dialog
                var processingDialog = new ProcessingDialog("Processing payment...");
                processingDialog.Show();

                // Simulate payment processing
                await System.Threading.Tasks.Task.Delay(2000);

                // Add credits to account
                var success = await _creditService.AddCreditsAsync(_selectedAmount, GetSelectedPaymentMethod().ToLower());

                processingDialog.Close();

                if (success)
                {
                    MessageBox.Show(
                        $"✅ Payment successful!\n\n" +
                        $"Added {_selectedCredits} credits to your account.\n" +
                        $"New balance: ${_creditService.GetAvailableCredits():F2}",
                        "Payment Successful",
                        MessageBoxButton.OK,
                        MessageBoxImage.Information);

                    LoadCurrentBalance();
                    DialogResult = true;
                    Close();
                }
                else
                {
                    MessageBox.Show(
                        "❌ Payment failed. Please try again or contact support.",
                        "Payment Failed",
                        MessageBoxButton.OK,
                        MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"❌ An error occurred: {ex.Message}",
                    "Payment Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error);
            }
        }

        private void Cancel_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        private void CustomAmountInput_TextChanged(object sender, TextChangedEventArgs e)
        {
            UpdateCustomAmountPreview();
        }

		private void ProcessPayment_Click(object sender, RoutedEventArgs e)
		{
			ProcessPayment();
		}
    }

    // Simple processing dialog
    public class ProcessingDialog : Window
    {
        public ProcessingDialog(string message)
        {
            Title = "Processing...";
            Width = 300;
            Height = 150;
            WindowStartupLocation = WindowStartupLocation.CenterScreen;
            ResizeMode = ResizeMode.NoResize;
            Background = System.Windows.Media.Brushes.Black;

            var grid = new Grid();
            var textBlock = new TextBlock
            {
                Text = message,
                Foreground = System.Windows.Media.Brushes.White,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center,
                FontSize = 16
            };

            grid.Children.Add(textBlock);
            Content = grid;
        }
    }
}
