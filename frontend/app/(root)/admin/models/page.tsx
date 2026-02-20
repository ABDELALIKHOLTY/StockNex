'use client';

import { useEffect, useState } from 'react';
import { SP500_SYMBOLS } from '@shared/data/sp500-symbols';
import { useAlert } from '@/app/context/AlertContext';
import { ClientOnly } from '@/app/components/ClientOnly';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Hyperparameters {
  lookback_period: number;
  epochs: number;
  batch_size: number;
  learning_rate: number;
}

interface PerformanceMetrics {
  mape: number;
  rmse: number;
  r_squared: number;
}


// Liste des entreprises S&P 500 (populaires)

interface TrainingModel {
  company: string;
  lookback_period: string;
  training_date: string;
  training_time_seconds: number;
  hyperparameters: Hyperparameters;
  performance: PerformanceMetrics;
  predictions: number[];
  final_training_loss: number;
  final_validation_loss: number;
  best_hyperparameters: {
    LSTM_units: number;
    dropout_rate: number;
    slicing_window: number;
  };
}

interface CompanyModels {
  company: string;
  available_models: TrainingModel[];
  count: number;
}

export default function ModelsPage() {
  return (
    <ClientOnly>
      <ModelsPageContent />
    </ClientOnly>
  );
}

function ModelsPageContent() {
  const { addAlert } = useAlert();
  const [allModels, setAllModels] = useState<CompanyModels[]>([]);
  const [filteredModels, setFilteredModels] = useState<CompanyModels[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [companySearch, setCompanySearch] = useState<string>('');
  const [modelSearch, setModelSearch] = useState<string>('');
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [lookbackPeriod, setLookbackPeriod] = useState<string>('10mo');
  const [daysAhead, setDaysAhead] = useState<number>(10);
  const [nTrials, setNTrials] = useState<number>(20);
  const [trainingMessage, setTrainingMessage] = useState<string>('');
  const [trainingError, setTrainingError] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch models on startup
  useEffect(() => {
    fetchAllModels();
  }, []);

  // Filter models based on search
  useEffect(() => {
    if (modelSearch.trim() === '') {
      setFilteredModels(allModels);
    } else {
      const searchLower = modelSearch.toLowerCase();
      const filtered = allModels
        .map(company => ({
          ...company,
          available_models: company.available_models.filter(model =>
            company.company.toLowerCase().includes(searchLower) ||
            model.training_date.includes(searchLower)
          ),
        }))
        .filter(company => company.available_models.length > 0);
      setFilteredModels(filtered);
    }
  }, [modelSearch, allModels]);

  // Function to load existing models
  const fetchAllModels = async () => {
    setLoading(true);
    setTrainingError('');
    try {
      const res = await fetch(`/admin/models/api/companies`);
      if (res.ok) {
        const data = await res.json();
        console.log('Available models:', data);
        setAllModels(data.companies || []);
        setFilteredModels(data.companies || []);
      } else {
        setAllModels([]);
        setFilteredModels([]);
      }
    } catch (error) {
      console.error('Error loading models:', error);
      setAllModels([]);
      setFilteredModels([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to train a model
  const handleTrainModel = async () => {
    if (!selectedCompany) {
      setTrainingError('Please select a company');
      addAlert({
        type: 'warning',
        title: 'Training Error',
        message: 'Please select a company before training',
      });
      return;
    }

    setShowModal(false); // Close modal immediately
    setTrainingLoading(true);
    setTrainingMessage('');
    setTrainingError('');
    
    console.log('🚀 Adding training started alert for:', selectedCompany);
    addAlert({
      type: 'info',
      title: 'Model Training Started',
      message: `Starting training for ${selectedCompany}. This may take minutes...`,
    });

    try {
      setTrainingMessage(`🚀 Starting training for ${selectedCompany}...\nThis may take minutes`);

      const response = await fetch('/admin/models/api/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: selectedCompany.toLowerCase(),
          lookback_period: lookbackPeriod,
          n_trials: nTrials,
          days_ahead: daysAhead,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        const errorDetail = errorData.detail || errorData.error || response.statusText;
        throw new Error(errorDetail);
      }

      const data = await response.json();

      setTrainingMessage(
        `✅ Model trained successfully!\n\n` +
        `Company: ${data.company}\n` +
        `Training time: ${data.training_time_seconds?.toFixed(2) || '?'} seconds\n` +
        `Training loss: ${data.performance?.final_train_loss?.toFixed(4)}\n` +
        `Validation loss: ${data.performance?.final_val_loss?.toFixed(4)}`
      );

      addAlert({
        type: 'success',
        title: 'Model Training Complete',
        message: `${selectedCompany} model trained successfully in ${data.training_time_seconds?.toFixed(2) || '?'} seconds`,
      });
      console.log('✅ Adding training complete alert');

      // Refresh list after 2 seconds
      setTimeout(() => {
        fetchAllModels();
        setTrainingMessage('');
        setSelectedCompany('');
        setLookbackPeriod('50mo');
        setDaysAhead(10);
        setNTrials(20);
      }, 2000);
   
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setTrainingError(`Error: ${errorMessage}`);
      setTrainingMessage('');
      
      console.log('❌ Adding training error alert:', errorMessage);
      addAlert({
        type: 'error',
        title: 'Model Training Failed',
        message: `Failed to train ${selectedCompany}: ${errorMessage}`,
      });
    } finally {
      setTrainingLoading(false);
    }
  };

  // Function to delete models
  const handleDeleteModel = async (company: string) => {
    setCompanyToDelete(company);
    setShowDeleteDialog(true);
  };

  // Function to confirm deletion
  const confirmDelete = async () => {
    if (!companyToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/admin/models/api/delete?company=${companyToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Deletion error');
      }

      // Fermer le dialog immédiatement
      setShowDeleteDialog(false);
      setCompanyToDelete('');
      setIsDeleting(false);

      setTrainingMessage(`✅ Model for ${companyToDelete} deleted`);
      addAlert({
        type: 'success',
        title: 'Model Deleted',
        message: `Model for ${companyToDelete} has been deleted successfully`,
      });

      // Recharger les modèles après un délai court
      setTimeout(() => {
        fetchAllModels();
        setTrainingMessage('');
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Deletion error';
      setTrainingError(`❌ Error: ${errorMessage}`);
      addAlert({
        type: 'error',
        title: 'Deletion Failed',
        message: `Failed to delete models for ${companyToDelete}: ${errorMessage}`,
      });
      setShowDeleteDialog(false);
      setCompanyToDelete('');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des modèles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              Prediction Models
            </h1>
            <p className="text-gray-400 text-lg">Manage and train your models</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              disabled={trainingLoading}
              className={`px-6 py-2 rounded-lg transition font-semibold shadow-lg ${
                trainingLoading
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
                  : 'bg-linear-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 hover:shadow-cyan-500/50'
              }`}
            >
              {trainingLoading ? '⏳ Training...' : '⚡ Train Model'}
            </button>
            <button
              onClick={() => setShowSearchBar(!showSearchBar)}
              disabled={trainingLoading}
              className={`px-6 py-2 rounded-lg transition font-semibold ${
                trainingLoading
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
              title="Search models by company name or date"
            >
              🔍 {showSearchBar ? 'Hide' : 'Search'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Models</div>
            <div className="text-3xl font-bold text-cyan-400">
              {allModels.reduce((sum, c) => sum + c.available_models.length, 0)}
            </div>
          </div>
          <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Companies</div>
            <div className="text-3xl font-bold text-blue-400">{allModels.length}</div>
          </div>
          <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Status</div>
            <div className="text-3xl font-bold text-green-400">Active</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {trainingMessage && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 whitespace-pre-line backdrop-blur animate-pulse">
          {trainingMessage}
        </div>
      )}

      {trainingError && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 whitespace-pre-line text-sm backdrop-blur">
          {trainingError}
        </div>
      )}

      {/* Search and Filter */}
      {showSearchBar && (
      <div className="mb-8 flex gap-4 animate-in fade-in">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Search models by company or training date..."
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition"
          />
        </div>
        {modelSearch && (
          <button
            onClick={() => setModelSearch('')}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-slate-300"
          >
            Clear
          </button>
        )}
      </div>
      )}

      {/* Models Display */}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-96 shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Train a Model
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Select Company (S&P 500)</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search or select company..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value.toUpperCase())}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition"
                  />
                  {companySearch && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-700 border border-slate-600 rounded-lg max-h-48 overflow-y-auto z-50 shadow-lg">
                      {SP500_SYMBOLS
                        .filter(company => company.includes(companySearch))
                        .slice(0, 15)
                        .map(company => (
                          <button
                            key={company}
                            onClick={() => {
                              setSelectedCompany(company);
                              setCompanySearch('');
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-slate-600 transition flex items-center gap-3 border-b border-slate-600 last:border-b-0 ${
                              selectedCompany === company ? 'bg-cyan-600/30' : ''
                            }`}
                          >
                            <img
                              src={`https://financialmodelingprep.com/image-stock/${company}.png`}
                              alt={company}
                              className="w-6 h-6 rounded-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-white">{company}</div>
                            </div>
                          </button>
                        ))
                      }
                    </div>
                  )}
                  {selectedCompany && (
                    <div className="mt-2 px-3 py-2 bg-slate-700/50 rounded text-sm text-gray-300">
                      Selected: <span className="font-bold text-cyan-400">{selectedCompany}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Lookback Period (months)</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={lookbackPeriod.replace('mo', '')}
                  onChange={(e) => setLookbackPeriod(e.target.value + 'mo')}
                  placeholder="Enter number of months"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition"
                />
                <p className="text-xs text-gray-400 mt-2">More historical data improves training signals, but model performance depends on data quality and market patterns</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Days Ahead</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={daysAhead}
                  onChange={e => setDaysAhead(parseInt(e.target.value))}
                  placeholder="Number of days"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">N Trials</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={nTrials}
                  onChange={e => setNTrials(parseInt(e.target.value))}
                  placeholder="Number of trials"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition"
                />
                <p className="text-xs text-gray-400 mt-2">More trials = better optimization but slower</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowModal(false);
                  setTrainingError('');
                }}
                className={`flex-1 px-4 py-3 rounded-lg transition font-semibold ${
                  trainingLoading
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
                    : 'bg-slate-700 hover:bg-slate-600 text-gray-200'
                }`}
                disabled={trainingLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleTrainModel}
                className="flex-1 px-4 py-3 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg transition font-bold text-white disabled:opacity-50 shadow-lg hover:shadow-cyan-500/50"
                disabled={trainingLoading}
              >
                {trainingLoading ? 'Training...' : 'Start'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Models */}
      {allModels.length === 0 ? (
        <div className="text-center py-20">
          <div className="mb-4 text-6xl">📊</div>
          <p className="text-2xl font-semibold text-gray-300 mb-2">No models trained yet</p>
          <p className="text-gray-400 mb-6">Start by creating your first model</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-linear-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition font-bold"
          >
            Create Model
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredModels.length > 0 ? (
            filteredModels.map(company => (
            <div key={company.company} className="bg-slate-700/30 backdrop-blur border border-slate-600 rounded-xl p-6 hover:border-cyan-500/50 transition group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-cyan-400 group-hover:text-cyan-300 transition">{company.company}</h3>
                  <p className="text-gray-400 text-sm mt-1">{company.available_models.length} model(s)</p>
                </div>
                <button
                  onClick={() => handleDeleteModel(company.company)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition"
                  title="Delete all models"
                >
                  🗑️
                </button>
              </div>

              {/* Models for this company */}
              <div className="space-y-3">
                {company.available_models.map((model, idx) => (
                  <div key={idx} className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-800 transition">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Period</div>
                        <div className="font-semibold text-gray-200">{model.lookback_period}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Date</div>
                        <div className="font-semibold text-gray-200 text-sm">{model.training_date}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                          📈 Train Loss
                        </div>
                        <div className="font-bold text-blue-400">{model.final_training_loss?.toFixed(4)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                          📈 Val Loss
                        </div>
                        <div className="font-bold text-green-400">{model.final_validation_loss?.toFixed(4)}</div>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm border-t border-slate-700 pt-3">
                      <div className="flex items-center gap-2 text-gray-400">
                        ⚡
                        LSTM: {model.best_hyperparameters?.LSTM_units}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        ⏱️
                        {model.training_time_seconds?.toFixed(2)}s
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
          ) : (
            <div className="col-span-full bg-slate-700/30 border border-dashed border-slate-600 rounded-xl p-12 text-center">
              <p className="text-gray-400 text-lg mb-2">No models found</p>
              <p className="text-gray-500 text-sm">Try adjusting your search filters or train a new model</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-400">
              ⚠️ Delete Model
            </DialogTitle>
            <DialogDescription className="text-gray-300 mt-2">
              Are you sure you want to delete the model for <span className="font-semibold text-white">{companyToDelete}</span>? 
              <br />
              <span className="text-sm text-red-300 mt-2 block">
                This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 flex justify-end mt-6">
            <button
              onClick={() => {
                setShowDeleteDialog(false);
                setCompanyToDelete('');
              }}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg border border-slate-600 text-gray-300 hover:bg-slate-700 hover:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Deleting...
                </>
              ) : (
                '🗑️ Delete the model'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
