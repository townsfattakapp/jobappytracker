import { defineTrack } from '../define'

export const timeSeries = defineTrack({
  id: 'track-time-series',
  title: 'Time Series Fundamentals',
  description: 'Working with ordered data in pandas and statsmodels: resampling and windows, trend and seasonality, stationarity and ACF/PACF, exponential smoothing and ARIMA, gradient boosting and Prophet, deep sequence models, backtesting, anomaly detection and forecasting at scale, ending in projects.',
  family: 'Data Science',
  kind: 'domain',
  icon: '📈',
  tags: ['time series', 'forecasting', 'arima', 'seasonality', 'statsmodels', 'prophet', 'anomaly detection'],
  languages: ['Python'],
  explainMode: 'data',
  code: { label: 'Python with the usual libraries (numpy, pandas, scikit-learn, torch)', id: 'python', fixed: true },
  supports: { coding: true, project: true },
  prerequisites: ['track-pandas'],
  style: 'practice',
  categories: [
    {
      title: 'Time Series Data',
      description: 'Getting ordered data into a shape that respects time.',
      topics: [
        {
          title: 'What makes time series different',
          description: 'Observations are ordered and correlated with their neighbours, so rows are not independent samples; this breaks random shuffling, changes how splits work, and makes the past the only legitimate source of features for the future.',
          concepts: ['Order and autocorrelation', 'Rows are not independent', 'Forecasting horizon', 'Univariate versus multivariate series'],
          quiz: [
            ['Why can you not shuffle a time series before splitting?', 'Shuffling lets the model train on future values and test on the past.'],
            ['What is the forecasting horizon?', 'How many steps ahead the model must predict.'],
          ],
        },
        {
          title: 'DatetimeIndex and time zones',
          description: 'A pandas DatetimeIndex enables slicing by date strings, frequency inference and alignment; parsing timestamps correctly, localising to a time zone and converting to UTC avoid off-by-one-hour bugs around daylight saving.',
          concepts: ['Parsing with pd.to_datetime', 'Date-string slicing', 'tz_localize and tz_convert', 'Daylight saving pitfalls'],
          quiz: [
            ['What does df.loc["2024-03"] return with a DatetimeIndex?', 'All rows in March 2024.'],
            ['Difference between tz_localize and tz_convert?', 'localize assigns a zone to naive timestamps; convert changes aware timestamps to another zone.'],
          ],
        },
        {
          title: 'Resampling and frequency conversion',
          description: 'resample groups timestamps into regular bins for downsampling with sum or mean, and asfreq or interpolate fill in when upsampling; choosing the aggregation and the bin label decides whether a daily total belongs to the start or end of the day.',
          concepts: ['resample with sum, mean, last', 'Downsampling versus upsampling', 'asfreq and interpolation', 'Bin labels and closed sides'],
          quiz: [
            ['How do you convert hourly data to daily totals?', 'df.resample("D").sum()'],
            ['What does asfreq do that resample does not?', 'It reindexes to a frequency without aggregating, leaving NaN where no value exists.'],
          ],
          prereqs: ['DatetimeIndex and time zones'],
        },
        {
          title: 'Missing timestamps and irregular series',
          description: 'Sensor gaps and event data produce irregular timestamps; reindexing to a full range exposes the gaps, and forward fill, interpolation or explicit zero depend on whether absence means "unchanged", "unknown" or "nothing happened".',
          concepts: ['Reindexing to a full date range', 'Forward fill versus interpolation', 'Absence meaning zero', 'Event data to regular series'],
          quiz: [
            ['When is forward fill correct?', 'When the value stays constant until the next observation, like a price or a state.'],
            ['How do you turn event timestamps into a daily count series?', 'Resample to daily with count and fill missing days with zero.'],
          ],
          prereqs: ['Resampling and frequency conversion'],
        },
        {
          title: 'Shifts, rolling and expanding windows',
          description: 'shift moves values along time to build lags and leads, rolling computes statistics over a trailing window, and expanding grows from the start; together they express most descriptive and feature-building operations on a series.',
          concepts: ['shift for lags and leads', 'rolling mean and std', 'expanding statistics', 'Window alignment and min_periods'],
          quiz: [
            ['What does s.shift(1) put in the first row?', 'NaN, since there is no previous value.'],
            ['What does min_periods control?', 'How many observations a window needs before producing a value.'],
          ],
          prereqs: ['Resampling and frequency conversion'],
        },
      ],
    },
    {
      title: 'Structure and Components',
      description: 'Seeing what a series is made of before modelling it.',
      topics: [
        {
          title: 'Trend, seasonality, cycles and noise',
          description: 'A series decomposes into a long-run trend, repeating seasonal patterns with fixed period, irregular cycles without one, and noise; recognising each in a plot decides which model family applies and what to remove before analysis.',
          concepts: ['Trend as long-run level', 'Seasonality with fixed period', 'Cycles without fixed period', 'Additive versus multiplicative structure'],
          quiz: [
            ['How do you tell seasonality from a cycle?', 'Seasonality repeats at a fixed period like weekly or yearly; cycles have varying length.'],
            ['When is a multiplicative model appropriate?', 'When seasonal swings grow with the level of the series.'],
          ],
        },
        {
          title: 'Decomposition with classical and STL methods',
          description: 'seasonal_decompose splits a series into trend, seasonal and residual by moving averages, while STL uses robust loess that tolerates changing seasonality and outliers; the residual shows what a seasonal model would leave to explain.',
          concepts: ['seasonal_decompose in statsmodels', 'STL and loess smoothing', 'Robust decomposition against outliers', 'Reading the residual component'],
          quiz: [
            ['What advantage does STL have over classical decomposition?', 'It handles seasonality that changes over time and is robust to outliers.'],
            ['What does a residual with visible pattern indicate?', 'The decomposition missed structure, such as a second seasonal period.'],
          ],
          prereqs: ['Trend, seasonality, cycles and noise'],
        },
        {
          title: 'Stationarity',
          description: 'A stationary series has constant mean, variance and autocorrelation over time, which ARIMA-style models assume; the Augmented Dickey-Fuller and KPSS tests check it, and a trending or seasonal series must be transformed first.',
          concepts: ['Constant mean and variance', 'Augmented Dickey-Fuller test', 'KPSS test', 'Why models assume stationarity'],
          quiz: [
            ['What does a small ADF p-value mean?', 'Reject the unit root; the series is likely stationary.'],
            ['Why use both ADF and KPSS?', 'They have opposite null hypotheses, so agreement gives confidence.'],
          ],
          prereqs: ['Trend, seasonality, cycles and noise'],
        },
        {
          title: 'Differencing and variance-stabilising transforms',
          description: 'First differencing removes a trend, seasonal differencing removes a repeating pattern, and a log or Box-Cox transform makes the variance constant; each step is undone in reverse when forecasts are converted back to the original scale.',
          concepts: ['First and second differencing', 'Seasonal differencing', 'Log and Box-Cox for variance', 'Inverting transforms on forecasts'],
          quiz: [
            ['How do you remove weekly seasonality from daily data by differencing?', 'Subtract the value from seven days earlier.'],
            ['What happens if you over-difference?', 'You introduce artificial negative autocorrelation and inflate variance.'],
          ],
          prereqs: ['Stationarity'],
        },
        {
          title: 'Autocorrelation and partial autocorrelation',
          description: 'The ACF measures correlation between a series and its lags, the PACF removes the effect of intermediate lags; their shapes reveal seasonality, suggest AR and MA orders and confirm whether residuals are white noise.',
          concepts: ['ACF plot and lag structure', 'PACF and direct lag effects', 'Reading seasonality from spikes', 'Confidence bands and white noise'],
          quiz: [
            ['What does a PACF that cuts off after lag 2 suggest?', 'An AR(2) process.'],
            ['What does an ACF that decays slowly indicate?', 'Non-stationarity or a strong trend.'],
          ],
          prereqs: ['Stationarity'],
        },
      ],
    },
    {
      title: 'Smoothing and Exponential Methods',
      description: 'Baselines and the exponential smoothing family that often wins in practice.',
      topics: [
        {
          title: 'Naive and seasonal naive baselines',
          description: 'Predicting the last value, the value from one season ago or the historical mean sets the floor every model must beat; on many business series the seasonal naive forecast is surprisingly hard to improve on.',
          concepts: ['Last-value forecast', 'Seasonal naive forecast', 'Mean and drift methods', 'Baselines as the reference'],
          quiz: [
            ['What is the seasonal naive forecast for next Monday?', 'The value from last Monday.'],
            ['Why always report a naive baseline?', 'A complex model that does not beat it adds nothing.'],
          ],
        },
        {
          title: 'Moving averages',
          description: 'Simple and weighted moving averages smooth noise to reveal level and trend, with the window length trading responsiveness against smoothness; centred windows describe the past well but cannot be used for forecasting.',
          concepts: ['Simple moving average', 'Weighted moving average', 'Window length trade-off', 'Trailing versus centred windows'],
          quiz: [
            ['Why can a centred moving average not forecast?', 'It uses future values on either side of each point.'],
            ['What does a longer window do?', 'Smooths more but lags behind changes.'],
          ],
          prereqs: ['Shifts, rolling and expanding windows'],
        },
        {
          title: 'Simple exponential smoothing',
          description: 'Each forecast is a weighted average where weights decay geometrically into the past, controlled by one parameter alpha; it suits series with no trend or seasonality and is the building block of the Holt-Winters family.',
          concepts: ['Level update equation', 'Alpha and memory length', 'Flat forecasts', 'Fitting alpha by likelihood'],
          quiz: [
            ['What does alpha close to 1 mean?', 'The forecast follows the most recent observation almost entirely.'],
            ['What shape is the multi-step forecast from simple exponential smoothing?', 'Flat at the last estimated level.'],
          ],
          prereqs: ['Moving averages'],
        },
        {
          title: 'Holt and Holt-Winters methods',
          description: 'Holt adds a trend component with its own smoothing parameter, and Holt-Winters adds additive or multiplicative seasonality; damped trends stop long-horizon forecasts from running away, and statsmodels ExponentialSmoothing fits all variants.',
          concepts: ['Trend component and beta', 'Seasonal component and gamma', 'Damped trend', 'ExponentialSmoothing in statsmodels'],
          quiz: [
            ['When choose multiplicative seasonality in Holt-Winters?', 'When seasonal amplitude scales with the level.'],
            ['What does a damped trend do?', 'Flattens the trend gradually so far-ahead forecasts do not grow without limit.'],
          ],
          prereqs: ['Simple exponential smoothing'],
        },
        {
          title: 'The ETS framework and automatic selection',
          description: 'Error, trend and seasonal components can each be none, additive or multiplicative, giving a taxonomy of state-space models; information criteria pick the combination, and prediction intervals follow from the model rather than from heuristics.',
          concepts: ['Error, trend, season taxonomy', 'State-space formulation', 'AIC-based model selection', 'Prediction intervals from ETS'],
          quiz: [
            ['What does ETS(A,Ad,M) denote?', 'Additive error, additive damped trend, multiplicative seasonality.'],
            ['Why prefer ETS over ad-hoc Holt-Winters?', 'It gives likelihood-based selection and proper prediction intervals.'],
          ],
          prereqs: ['Holt and Holt-Winters methods'],
        },
      ],
    },
    {
      title: 'ARIMA Family',
      description: 'Autoregressive models: how they work, how to pick orders and how to check them.',
      topics: [
        {
          title: 'Autoregressive and moving average models',
          description: 'An AR(p) model regresses the value on its own last p values, an MA(q) model on the last q forecast errors; they describe short-memory dependence, and their ACF and PACF signatures are what order selection reads.',
          concepts: ['AR(p) on past values', 'MA(q) on past errors', 'Stationarity conditions', 'ACF and PACF signatures'],
          quiz: [
            ['How does an MA(1) ACF look?', 'One significant spike at lag 1 then nothing.'],
            ['What does the AR coefficient near 1 imply?', 'Very persistent behaviour close to a random walk.'],
          ],
          prereqs: ['Autocorrelation and partial autocorrelation'],
        },
        {
          title: 'ARIMA and order selection',
          description: 'ARIMA(p,d,q) combines differencing with AR and MA terms; d comes from stationarity tests, p and q from ACF and PACF or from searching by AIC, and auto-ARIMA tools automate the search while you still check the result.',
          concepts: ['Choosing d from stationarity tests', 'Choosing p and q', 'AIC and BIC comparison', 'auto_arima search'],
          quiz: [
            ['What does the d in ARIMA(1,1,1) mean?', 'The series is differenced once before fitting AR and MA terms.'],
            ['Why not pick the model with the lowest training error?', 'More parameters always fit better; AIC penalises complexity.'],
          ],
          prereqs: ['Autoregressive and moving average models', 'Differencing and variance-stabilising transforms'],
        },
        {
          title: 'Seasonal ARIMA',
          description: 'SARIMA adds seasonal AR, differencing and MA terms at the seasonal lag, written as (p,d,q)(P,D,Q)s; it captures weekly or yearly patterns that plain ARIMA cannot, at the cost of more orders to choose.',
          concepts: ['Seasonal orders (P,D,Q)s', 'Seasonal differencing inside SARIMA', 'Reading seasonal spikes in ACF', 'Fitting with SARIMAX'],
          quiz: [
            ['What does s equal for monthly data with yearly seasonality?', '12.'],
            ['What does a seasonal MA term model?', 'Dependence on the forecast error one season ago.'],
          ],
          prereqs: ['ARIMA and order selection'],
        },
        {
          title: 'Exogenous regressors with ARIMAX',
          description: 'Adding external variables such as price, promotions or weather to an ARIMA model explains variation the series alone cannot; future values of the regressors must be known or forecast, which limits which variables are usable.',
          concepts: ['Adding exogenous variables', 'Known-future versus forecast regressors', 'Interpreting regressor coefficients', 'Holiday and event dummies'],
          quiz: [
            ['What is required to forecast with ARIMAX?', 'Future values of every exogenous regressor.'],
            ['Give an example of a known-future regressor.', 'A planned promotion calendar or public holidays.'],
          ],
          prereqs: ['Seasonal ARIMA'],
        },
        {
          title: 'Residual diagnostics',
          description: 'A well-specified model leaves residuals that are uncorrelated, roughly normal and of constant variance; the Ljung-Box test, residual ACF, QQ plot and residual-over-time plot each check one property and point to what the model still misses.',
          concepts: ['Ljung-Box test for autocorrelation', 'Residual ACF check', 'Normality and QQ plots', 'Heteroscedastic residuals'],
          quiz: [
            ['What does a significant Ljung-Box statistic mean?', 'Residuals are still autocorrelated; the model is missing structure.'],
            ['What does a residual plot with growing spread suggest?', 'Variance changes over time; a log transform or GARCH-type model may help.'],
          ],
          prereqs: ['ARIMA and order selection'],
        },
      ],
    },
    {
      title: 'Machine Learning for Forecasting',
      description: 'Reframing forecasting as supervised learning and the models that follow.',
      topics: [
        {
          title: 'Framing forecasting as supervised learning',
          description: 'Turning a series into rows of lagged values and a target at a chosen horizon lets any regressor forecast; the window of lags, the horizon and the train-test split in time are the design decisions that make it valid.',
          concepts: ['Lag window to feature matrix', 'Target at horizon h', 'Time-ordered train test split', 'One row per timestamp'],
          quiz: [
            ['What is the target for a 7-day-ahead model?', 'The value seven steps after the row\'s timestamp.'],
            ['Why must lags stop before the horizon?', 'Using values closer than h steps would not be available at prediction time.'],
          ],
          prereqs: ['Shifts, rolling and expanding windows'],
        },
        {
          title: 'Feature engineering for time',
          description: 'Calendar features, cyclical encodings, holiday flags, lags at meaningful periods, rolling means and standard deviations, and time since the last event give a tree model the seasonality and memory it cannot learn from a timestamp alone.',
          concepts: ['Calendar and holiday features', 'Cyclical sine and cosine encoding', 'Lag and rolling statistics', 'Time since last event'],
          quiz: [
            ['Why encode month with sine and cosine?', 'So December and January are close together as they are in reality.'],
            ['Which lag is most useful for weekly seasonality in daily data?', 'Lag 7.'],
          ],
          prereqs: ['Framing forecasting as supervised learning'],
        },
        {
          title: 'Regression and gradient boosting forecasters',
          description: 'Linear models with lag and calendar features are robust and interpretable, and gradient boosting such as LightGBM captures interactions and non-linearity; trees cannot extrapolate a trend, so detrending or a trend feature is needed.',
          concepts: ['Linear models on lag features', 'Gradient boosting for forecasting', 'Trees cannot extrapolate trends', 'Detrending before boosting'],
          quiz: [
            ['Why does a gradient boosting model forecast a flat line beyond the training range?', 'Trees predict from leaf values seen in training and cannot extrapolate.'],
            ['How do you fix that?', 'Model the trend separately or use differences as the target.'],
          ],
          prereqs: ['Feature engineering for time'],
        },
        {
          title: 'Direct and recursive multi-step strategies',
          description: 'Recursive forecasting feeds each prediction back as a lag, accumulating error over the horizon; direct forecasting trains one model per horizon step, and multi-output models predict all steps at once, each with different bias and cost.',
          concepts: ['Recursive strategy and error accumulation', 'Direct strategy per horizon', 'Multi-output models', 'Choosing by horizon length'],
          quiz: [
            ['What is the weakness of recursive forecasting?', 'Errors compound because predictions feed later predictions.'],
            ['How many models does the direct strategy need for a 14-step horizon?', 'Fourteen.'],
          ],
          prereqs: ['Regression and gradient boosting forecasters'],
        },
        {
          title: 'Prophet overview',
          description: 'Prophet fits a piecewise-linear trend with automatic changepoints plus Fourier seasonality and holiday effects in a decomposable model; it handles missing data and irregular sampling gracefully and is tuned by a few interpretable settings.',
          concepts: ['Piecewise trend and changepoints', 'Fourier seasonality terms', 'Holiday effects', 'Prophet strengths and limitations'],
          quiz: [
            ['How does Prophet model seasonality?', 'As a sum of Fourier terms with a chosen number of harmonics.'],
            ['When does Prophet struggle?', 'On series driven by short-memory autocorrelation rather than trend and seasonality.'],
          ],
          prereqs: ['Decomposition with classical and STL methods'],
        },
        {
          title: 'Deep learning for sequences overview',
          description: 'Recurrent networks, temporal convolutions and transformers learn features from raw windows and share parameters across many series; they shine with large multivariate datasets and struggle to beat boosting on small, noisy ones.',
          concepts: ['LSTM and GRU on windows', 'Temporal convolutional networks', 'Transformers and N-BEATS families', 'Data scale where deep models win'],
          quiz: [
            ['When are deep sequence models worth it?', 'With many related series and lots of history, where shared patterns can be learned.'],
            ['What input does an LSTM forecaster take?', 'A fixed-length window of past values, optionally with covariates.'],
          ],
          prereqs: ['Regression and gradient boosting forecasters'],
        },
      ],
    },
    {
      title: 'Evaluation and Backtesting',
      description: 'Measuring forecast quality the way it will be used.',
      topics: [
        {
          title: 'Forecast accuracy metrics',
          description: 'MAE and RMSE report error in units, MAPE and sMAPE report percentages but misbehave near zero, and MASE scales error by the naive baseline so it compares across series; choosing among them depends on scale, zeros and the cost of errors.',
          concepts: ['MAE and RMSE in units', 'MAPE and the zero problem', 'sMAPE bounds', 'MASE relative to naive'],
          quiz: [
            ['Why is MAPE unusable for intermittent demand?', 'Actual values of zero make it undefined or infinite.'],
            ['What does MASE below 1 mean?', 'The model beats the naive baseline on average.'],
          ],
          prereqs: ['Naive and seasonal naive baselines'],
        },
        {
          title: 'Backtesting with rolling origins',
          description: 'A single train-test split at the end tests one moment in time; rolling-origin backtesting refits or re-forecasts from many cut-off points and averages errors by horizon, which shows how accuracy degrades with lead time.',
          concepts: ['Rolling origin evaluation', 'Expanding versus sliding training windows', 'Error by horizon step', 'Refit frequency and cost'],
          quiz: [
            ['Why backtest from multiple origins?', 'One split may fall in an unusual period; many origins give a stable estimate.'],
            ['What does error by horizon reveal?', 'How quickly accuracy decays as forecasts reach further ahead.'],
          ],
          prereqs: ['Forecast accuracy metrics'],
        },
        {
          title: 'Prediction intervals',
          description: 'A point forecast without a range hides risk; model-based intervals from ETS and ARIMA, empirical quantiles of backtest residuals, quantile regression and conformal methods give ranges whose coverage should be checked on held-out data.',
          concepts: ['Model-based intervals', 'Empirical residual quantiles', 'Quantile regression forecasts', 'Checking interval coverage'],
          quiz: [
            ['How do you check a 90% interval?', 'Roughly 90% of held-out actuals should fall inside it.'],
            ['Why do intervals widen with horizon?', 'Uncertainty accumulates the further ahead you forecast.'],
          ],
          prereqs: ['Backtesting with rolling origins'],
        },
        {
          title: 'Forecast bias and comparing to baselines',
          description: 'Mean error shows systematic over- or under-forecasting that averaged absolute errors hide; comparing every candidate to the seasonal naive on the same backtest, with a paired test across origins, decides whether a model earns its complexity.',
          concepts: ['Mean error as bias', 'Same backtest for all candidates', 'Paired comparison across origins', 'Complexity versus gain'],
          quiz: [
            ['What does a consistently negative mean error indicate?', 'The model under-forecasts on average.'],
            ['Why compare models on identical backtest windows?', 'Different windows contain different difficulty, making scores incomparable.'],
          ],
          prereqs: ['Backtesting with rolling origins'],
        },
      ],
    },
    {
      title: 'Anomaly Detection and Special Cases',
      description: 'Finding unusual points and handling series that break the usual assumptions.',
      topics: [
        {
          title: 'Statistical anomaly detection',
          description: 'Rolling z-scores, deviation from a seasonal decomposition residual and forecast-interval breaches flag points that a model did not expect; the threshold sets the trade-off between missed incidents and false alarms.',
          concepts: ['Rolling z-score thresholds', 'Residual-based detection', 'Forecast interval breaches', 'Tuning the alert threshold'],
          quiz: [
            ['Why use decomposition residuals rather than raw values?', 'A high value on a peak day is normal; the residual removes expected seasonality.'],
            ['What happens when the threshold is too low?', 'Alert fatigue from false positives.'],
          ],
          prereqs: ['Decomposition with classical and STL methods'],
        },
        {
          title: 'Change point detection',
          description: 'A change point is a shift in level, trend or variance rather than a single spike; CUSUM, binary segmentation and the PELT algorithm in the ruptures library locate them, which matters for both alerting and choosing how much history to train on.',
          concepts: ['Level and trend shifts', 'CUSUM statistics', 'PELT and binary segmentation', 'Training only after the last change'],
          quiz: [
            ['How does a change point differ from an outlier?', 'The series stays at the new level afterwards instead of returning.'],
            ['Why does a change point matter for training?', 'Data before a structural break may no longer describe the current process.'],
          ],
          prereqs: ['Statistical anomaly detection'],
        },
        {
          title: 'Machine learning anomaly detectors',
          description: 'Isolation forests, one-class models and autoencoders score windows of a series by how unusual they are, catching multivariate and shape anomalies that per-point thresholds miss; window construction and contamination rate are the key settings.',
          concepts: ['Windows as feature vectors', 'Isolation forest scoring', 'Autoencoder reconstruction error', 'Contamination rate and evaluation'],
          quiz: [
            ['What does an isolation forest exploit?', 'Anomalies are isolated with fewer random splits than normal points.'],
            ['How does an autoencoder detect anomalies?', 'Windows it reconstructs poorly are unlike the training data.'],
          ],
          prereqs: ['Statistical anomaly detection'],
        },
        {
          title: 'Intermittent and sparse demand',
          description: 'Series with many zeros, such as spare-part sales, break MAPE and mislead smoothing; Croston\'s method models demand size and interval separately, and count models or classification-plus-regression handle the zeros explicitly.',
          concepts: ['Zeros and metric breakdown', 'Croston\'s method', 'Two-part models for zeros', 'Aggregating to reduce sparsity'],
          quiz: [
            ['What does Croston\'s method forecast?', 'Average demand size divided by average interval between demands.'],
            ['Which metric suits intermittent series?', 'MAE, RMSE or MASE, not MAPE.'],
          ],
          prereqs: ['Forecast accuracy metrics'],
        },
      ],
    },
    {
      title: 'Forecasting at Scale',
      description: 'From one series in a notebook to thousands in production.',
      topics: [
        {
          title: 'Hierarchical and grouped forecasting',
          description: 'Sales by product roll up to category and total, and forecasts at each level should agree; bottom-up, top-down and optimal reconciliation methods combine forecasts across the hierarchy so the sum of parts equals the whole.',
          concepts: ['Hierarchies and aggregation levels', 'Bottom-up and top-down', 'Reconciliation for coherence', 'Choosing the modelling level'],
          quiz: [
            ['What does reconciliation guarantee?', 'Forecasts at lower levels sum to the forecast at the higher level.'],
            ['Why not just forecast at the bottom level?', 'Bottom series are noisy; higher levels are smoother and carry signal.'],
          ],
        },
        {
          title: 'Global models across many series',
          description: 'Training one gradient boosting or neural model on all series with a series identifier and scaled targets shares patterns across products or stores, beating per-series models when histories are short; scaling and grouping features are essential.',
          concepts: ['One model for all series', 'Series identifiers as features', 'Per-series scaling of targets', 'When local models still win'],
          quiz: [
            ['Why scale each series before a global model?', 'So a high-volume product does not dominate the loss.'],
            ['What is the main benefit of a global model?', 'Cross-learning: short or new series borrow patterns from similar ones.'],
          ],
          prereqs: ['Regression and gradient boosting forecasters'],
        },
        {
          title: 'Forecasting pipelines and automation',
          description: 'A production forecast is a scheduled pipeline: load and validate data, build features, backtest, fit, forecast, store, and publish; each run is logged with its data cut-off so any forecast can be reproduced and audited.',
          concepts: ['Scheduled end-to-end pipeline', 'Data validation on each run', 'Storing forecasts with cut-off dates', 'Reproducing a past forecast'],
          quiz: [
            ['Why store the data cut-off with each forecast?', 'To compare forecasts fairly and reproduce what the model knew at the time.'],
            ['What should fail a pipeline run?', 'Missing recent data, schema changes or a backtest score below threshold.'],
          ],
          prereqs: ['Backtesting with rolling origins'],
        },
        {
          title: 'Forecast monitoring and retraining',
          description: 'Tracking realised error against expected error, bias drift and interval coverage over time detects degradation; retraining on a schedule or when error crosses a threshold keeps forecasts current after shifts in demand.',
          concepts: ['Realised versus expected error', 'Bias drift alerts', 'Coverage monitoring', 'Scheduled versus triggered retraining'],
          quiz: [
            ['What signal suggests the model needs retraining?', 'Error or bias rising above the backtest baseline for several periods.'],
            ['Why monitor interval coverage?', 'A model whose intervals miss too often misstates risk to decision makers.'],
          ],
          prereqs: ['Forecasting pipelines and automation'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      topics: [
        {
          title: 'Project: retail demand forecast with backtesting',
          description: 'Forecast daily sales for several stores: build seasonal naive, Holt-Winters, SARIMA and LightGBM models with calendar and lag features, backtest them on rolling origins, and produce a comparison report with MASE and error by horizon.',
          concepts: ['Prepare and resample the sales data', 'Fit baseline and classical models', 'Build the boosting forecaster', 'Backtest and compare'],
          quiz: [
            ['Which model must every candidate beat?', 'The seasonal naive baseline.'],
            ['Why backtest rather than one split?', 'Retail has promotions and holidays; one split may be unrepresentative.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: energy load forecasting with weather',
          description: 'Forecast hourly electricity load one day ahead using temperature forecasts as exogenous inputs: hourly and weekly seasonality, holiday effects, an ARIMAX and a boosting model, and prediction intervals with checked coverage.',
          concepts: ['Align load and weather data', 'Model multiple seasonalities', 'Add exogenous weather regressors', 'Produce and validate intervals'],
          quiz: [
            ['Why is temperature a valid exogenous regressor?', 'Its forecast is available ahead of time, so future values exist at prediction.'],
            ['What is the relationship between temperature and load?', 'U-shaped: both heating and cooling raise demand.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: anomaly detection on server metrics',
          description: 'Detect incidents in a multivariate metrics stream: STL residual thresholds, an isolation forest on windows, and change point detection, evaluated against labelled incidents with precision, recall and time to detection.',
          concepts: ['Build the metrics dataset', 'Implement three detectors', 'Evaluate against labelled incidents', 'Tune thresholds for alerting'],
          quiz: [
            ['What is time to detection?', 'The delay between an incident starting and the first alert.'],
            ['Why evaluate on labelled incidents?', 'Without labels you cannot distinguish sensitivity from false alarms.'],
          ],
          style: 'project',
        },
        {
          title: 'Project: global forecaster for hundreds of products',
          description: 'Train one gradient boosting model across a product catalogue with per-series scaling, hierarchical reconciliation to category totals and a scheduled pipeline that writes forecasts with their cut-off dates and monitoring metrics.',
          concepts: ['Assemble the multi-series dataset', 'Train the global model', 'Reconcile to the hierarchy', 'Automate and monitor runs'],
          quiz: [
            ['How do new products with no history get forecasts?', 'The global model uses product attributes and category patterns.'],
            ['What makes forecasts coherent across levels?', 'A reconciliation step after modelling.'],
          ],
          style: 'project',
        },
        {
          title: 'Time series interview questions',
          description: 'Common questions: explain stationarity and how to test it, choose between ARIMA and boosting, avoid leakage in time-series validation, handle multiple seasonalities, and explain why MAPE failed on a client dataset.',
          concepts: ['Stationarity and model choice questions', 'Validation and leakage questions', 'Seasonality handling questions', 'Metric pitfalls explained aloud'],
          quiz: [
            ['How would you validate a forecasting model?', 'With rolling-origin backtesting on time-ordered splits, never with shuffled k-fold.'],
            ['Daily data has weekly and yearly patterns. Options?', 'Fourier terms, multiple seasonal decomposition, Prophet, or calendar features in a boosting model.'],
          ],
          style: 'reading',
        },
        {
          title: 'Pandas time series drills',
          description: 'Timed exercises: resample irregular events to hourly counts, compute a leak-free 7-day rolling mean per group, build a lag feature matrix for horizon 3, and compute MASE from scratch, each verified against a known answer.',
          concepts: ['Resampling under time pressure', 'Grouped rolling without leakage', 'Lag matrix construction', 'MASE from scratch'],
          quiz: [
            ['Write the pandas for a 7-day trailing mean excluding today.', 's.shift(1).rolling(7).mean()'],
            ['What is the denominator of MASE?', 'The mean absolute error of the naive forecast on the training data.'],
          ],
        },
      ],
    },
  ],
})
