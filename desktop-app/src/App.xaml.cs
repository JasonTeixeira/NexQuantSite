using System;
using System.Windows;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Serilog;
using QuantumTrader.Services;
using QuantumTrader.Security;
// Note: service types are in QuantumTrader.Services root namespace
using QuantumTrader.Execution;
using Microsoft.EntityFrameworkCore;
using Polly;
using System.Net.Http;
using System.Threading.Tasks;

namespace QuantumTrader
{
	public partial class App : Application
	{
		private ServiceProvider _serviceProvider;
		private ILogger<App> _logger;
		public ServiceProvider Services => _serviceProvider;

		protected override void OnStartup(StartupEventArgs e)
		{
			try
			{
				// Ensure single instance
				bool createdNew;
				var appMutex = new System.Threading.Mutex(true, "Global/QuantumTrader.SingleInstance", out createdNew);
				if (!createdNew)
				{
					MessageBox.Show("Quantum Trader is already running.", "Already Running", MessageBoxButton.OK, MessageBoxImage.Information);
					Shutdown();
					return;
				}

				// Configure services
				ConfigureServices();

				_logger?.LogInformation("Application starting...");

				// Show main window
				// Load local persisted maps before UI
				try { OrderStore.LoadMaps(); } catch { }
				var mainWindow = _serviceProvider.GetService<MainWindow>();
				if (mainWindow == null)
				{
					_logger?.LogError("Failed to resolve MainWindow from DI container.");
					throw new InvalidOperationException("MainWindow not available");
				}
				mainWindow.Show();
				_logger?.LogInformation("MainWindow shown");

				base.OnStartup(e);
			}
			catch (Exception ex)
			{
				try { _logger?.LogError(ex, "Startup failure"); } catch { }
				var details = ex.ToString();
				try
				{
					System.IO.Directory.CreateDirectory("logs");
					System.IO.File.WriteAllText("logs/startup-error.txt", details);
				}
				catch { }
				MessageBox.Show($"Application startup failed: {details}", "Startup Error",
					MessageBoxButton.OK, MessageBoxImage.Error);
				Shutdown();
			}
		}

		private void ConfigureServices()
		{
			// Build configuration
			var configuration = new ConfigurationBuilder()
				.SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
				.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
				.AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
				.AddEnvironmentVariables()
				.Build();

			// Configure Serilog with enrichment, rolling policies and Sentry sink (Phase 3 observability)
			Log.Logger = new LoggerConfiguration()
				.Enrich.WithEnvironmentName()
				.Enrich.WithMachineName()
				.Enrich.WithThreadId()
				.WriteTo.Console()
				.WriteTo.File(
					path: "logs/quantum-trader-.log",
					rollingInterval: RollingInterval.Day,
					retainedFileCountLimit: 30,
					fileSizeLimitBytes: 50 * 1024 * 1024,
					rollOnFileSizeLimit: true,
					shared: true)
				.WriteTo.Sentry(o =>
				{
					o.Dsn = configuration["Observability:Sentry:Dsn"];
					o.Debug = false;
					o.TracesSampleRate = 0.1;
				})
				.CreateLogger();

			// Configure services
			var services = new ServiceCollection();

			// Configuration
			services.AddSingleton<IConfiguration>(configuration);

			// Logging
			services.AddLogging(builder =>
			{
				builder.AddSerilog(dispose: true);
			});

			// Secrets provider
			services.AddSingleton<ISecretsProvider, SecretsProvider>();

			// Security services
			services.AddSingleton<SecurityMiddleware>();
			services.AddSingleton<CircuitBreakerService>();
			services.AddSingleton<SecureErrorHandler>();
			services.AddSingleton<RetryPolicyService>();
			services.AddSingleton<ProductionReadinessValidator>();

			// Integration bridges - Connect to Python infrastructure
			services.AddSingleton<Integration.RealTimeMarketDataGateway>();
			services.AddSingleton<Integration.RiskManagementBridge>();
			services.AddSingleton<Integration.LiveOrderExecutionBridge>();
			services.AddSingleton<Integration.StrategyExecutionPipeline>();
			services.AddSingleton<Integration.MonitoringIntegration>();
			services.AddSingleton<Integration.PaperTradingCoordinator>();

			// Comprehensive Testing Framework
			services.AddSingleton<Testing.TestExecutionService>();
			services.AddSingleton<Testing.ComprehensiveTestSuite>();
			services.AddSingleton<Testing.UIComponentTester>();
			services.AddSingleton<Testing.IntegrationTester>();
			services.AddSingleton<Testing.PerformanceTester>();
			services.AddSingleton<Testing.SecurityTester>();
			services.AddSingleton<Testing.BusinessLogicTester>();

			// HTTP Client with basic configuration
			services.AddHttpClient("QuantumTrader", client =>
			{
				client.Timeout = TimeSpan.FromSeconds(30);
			});

			// Market data
			services.AddSingleton<MarketDataService>();

			// Safety services
			services.AddSingleton<IKillSwitchService, KillSwitchService>();
			services.AddSingleton<IOrderRateLimiter, OrderRateLimiter>();
			services.AddSingleton<IRiskStateStore, RiskStateStore>();
			services.AddSingleton<IRiskPolicyService, RiskPolicyService>();
			services.AddSingleton<IAuditLogger, FileAuditLogger>();
			services.AddSingleton<IAuditReader, FileAuditReader>();
			services.AddSingleton<IReconStatus, ReconStatusService>();

			// Credits DB (local sqlite) - use singleton lifetime for desktop app simplicity
			services.AddDbContext<CreditsDbContext>(options =>
				options.UseSqlite("Data Source=Credits.db"),
				optionsLifetime: ServiceLifetime.Singleton,
				contextLifetime: ServiceLifetime.Singleton);

			// Credit system as singleton (safe with singleton DbContext here)
			services.AddSingleton<CreditSystemService>();
			services.AddSingleton<IPnLCalculationService, PnLCalculationService>();
			services.AddSingleton<IStrategyExecutionService, StrategyExecutionService>();
			services.AddSingleton<IRealTimeUpdateService, RealTimeUpdateService>();
			services.AddSingleton<IAIAssistantService, AIAssistantService>();

			// Multi-Account Management System
			services.AddSingleton<IMultiAccountManagerService, MultiAccountManagerService>();
			services.AddSingleton<IBuiltInStrategiesService, BuiltInStrategiesService>();
			services.AddSingleton<ILiveTradingDashboardService, LiveTradingDashboardService>();



			// Strategy Hub System
			services.AddSingleton<IStrategyHubService, StrategyHubService>();

			// Strategy Store System
			services.AddSingleton<IStrategyStoreService, SimpleStrategyStoreService>();

			// Analytics System
			services.AddSingleton<IAnalyticsService, AnalyticsService>();



			// Broker adapters - Register all available brokers
			services.AddTransient<Execution.AlpacaAdapter>();
			services.AddTransient<Execution.NinjaTraderAdapter>();
			services.AddTransient<Execution.InteractiveBrokersAdapter>();
			services.AddTransient<Execution.TradovateAdapter>();

			// Broker Manager for dynamic switching
			services.AddSingleton<IBrokerManager, BrokerManager>();

			// Default broker adapter - Register NinjaTrader as default for now
			services.AddSingleton<Execution.IBrokerAdapter, Execution.NinjaTraderAdapter>();

			// Order execution service
			services.AddSingleton<Execution.IOrderExecutionService, Execution.OrderExecutionService>();
			services.AddHostedService<Execution.ReconciliationService>();
			services.AddHostedService<NtHeartbeatService>();
			services.AddHostedService<DailyPnlAggregator>();
			services.AddHostedService<NtEventListenerService>();

			// Execution layer wiring will be added as part of the broker integration task

			// Licensing service (enforces subscription)
			services.AddSingleton<ILicenseService, LicenseService>();

			// Windows
			services.AddTransient<MainWindow>();

			_serviceProvider = services.BuildServiceProvider();

			// Get logger
			_logger = _serviceProvider.GetRequiredService<ILogger<App>>();

			// Reflect demo/live mode to environment for UI logic
			try
			{
				var useStub = bool.TryParse(configuration["NinjaTrader:UseStub"], out var b) && b;
				Environment.SetEnvironmentVariable("DEMO_MODE", useStub ? "true" : "false");
			}
			catch { }
		}

		protected override void OnExit(ExitEventArgs e)
		{
			try
			{
				_logger?.LogInformation("Application shutting down...");
				_serviceProvider?.Dispose();
				Log.CloseAndFlush();
			}
			catch (Exception ex)
			{
				MessageBox.Show($"Error during shutdown: {ex.Message}", "Shutdown Error",
					MessageBoxButton.OK, MessageBoxImage.Warning);
			}

			base.OnExit(e);
		}

		private void Application_DispatcherUnhandledException(object sender, System.Windows.Threading.DispatcherUnhandledExceptionEventArgs e)
		{
			// Enhanced error handling with security logging
			try
			{
				var errorHandler = _serviceProvider?.GetService<SecureErrorHandler>();
				if (errorHandler != null)
				{
					var result = errorHandler.HandleServiceErrorAsync(e.Exception, "Application", "UnhandledException").Result;
					MessageBox.Show($"Error ID: {result.ErrorId}\n\n{result.UserMessage}\n\n{result.SuggestedAction}",
						"Application Error", MessageBoxButton.OK, MessageBoxImage.Error);
				}
				else
				{
					_logger?.LogError(e.Exception, "Unhandled application exception");
					MessageBox.Show("An unexpected error occurred. Please restart the application.",
						"Application Error", MessageBoxButton.OK, MessageBoxImage.Error);
				}
			}
			catch
			{
				// Fallback error handling
				MessageBox.Show("A critical error occurred. Please restart the application.",
					"Critical Error", MessageBoxButton.OK, MessageBoxImage.Error);
			}

			e.Handled = true;
		}


	}
}
