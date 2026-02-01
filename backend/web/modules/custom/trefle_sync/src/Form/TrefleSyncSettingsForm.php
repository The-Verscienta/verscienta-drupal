<?php

declare(strict_types=1);

namespace Drupal\trefle_sync\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\key\KeyRepositoryInterface;
use Drupal\trefle_sync\TrefleSyncServiceInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Configuration form for Trefle Sync settings.
 */
class TrefleSyncSettingsForm extends ConfigFormBase {

  /**
   * The key repository.
   *
   * @var \Drupal\key\KeyRepositoryInterface
   */
  protected KeyRepositoryInterface $keyRepository;

  /**
   * The Trefle sync service.
   *
   * @var \Drupal\trefle_sync\TrefleSyncServiceInterface
   */
  protected TrefleSyncServiceInterface $trefleSyncService;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    $instance = parent::create($container);
    $instance->keyRepository = $container->get('key.repository');
    $instance->trefleSyncService = $container->get('trefle_sync.service');
    return $instance;
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'trefle_sync_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['trefle_sync.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('trefle_sync.settings');

    // Get available keys.
    $keys = $this->keyRepository->getKeys();
    $keyOptions = ['' => $this->t('- Select a key -')];
    foreach ($keys as $key) {
      $keyOptions[$key->id()] = $key->label();
    }

    $form['api_settings'] = [
      '#type' => 'details',
      '#title' => $this->t('API Settings'),
      '#open' => TRUE,
    ];

    $form['api_settings']['api_key_id'] = [
      '#type' => 'select',
      '#title' => $this->t('API Key'),
      '#description' => $this->t('Select the Key entity containing your Trefle.io API token. <a href=":url">Create a new key</a> if needed.', [
        ':url' => '/admin/config/system/keys/add',
      ]),
      '#options' => $keyOptions,
      '#default_value' => $config->get('api_key_id'),
      '#required' => TRUE,
    ];

    $form['api_settings']['test_connection'] = [
      '#type' => 'button',
      '#value' => $this->t('Test Connection'),
      '#ajax' => [
        'callback' => '::testConnectionCallback',
        'wrapper' => 'connection-test-result',
      ],
    ];

    $form['api_settings']['connection_result'] = [
      '#type' => 'container',
      '#attributes' => ['id' => 'connection-test-result'],
    ];

    $form['import_settings'] = [
      '#type' => 'details',
      '#title' => $this->t('Import Settings'),
      '#open' => TRUE,
    ];

    $form['import_settings']['batch_size'] = [
      '#type' => 'number',
      '#title' => $this->t('Batch Size'),
      '#description' => $this->t('Number of plants to process per batch operation (1-100).'),
      '#default_value' => $config->get('batch_size') ?: 20,
      '#min' => 1,
      '#max' => 100,
      '#required' => TRUE,
    ];

    $form['import_settings']['sync_images'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Sync Images'),
      '#description' => $this->t('Download and attach plant images from Trefle. This may increase import time.'),
      '#default_value' => $config->get('sync_images'),
    ];

    $form['import_settings']['update_existing'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Update Existing Plants'),
      '#description' => $this->t('Update herb nodes that have already been imported from Trefle.'),
      '#default_value' => $config->get('update_existing'),
    ];

    $form['filter_settings'] = [
      '#type' => 'details',
      '#title' => $this->t('Filtering'),
      '#open' => TRUE,
    ];

    $form['filter_settings']['filter_edible_only'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Only import edible plants'),
      '#description' => $this->t('Filter to only import plants marked as edible in the Trefle API. This is the primary filter for nutritional benefits.'),
      '#default_value' => $config->get('filter_edible_only') ?? TRUE,
    ];

    $form['filter_settings']['filter_vegetable'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Include vegetables'),
      '#description' => $this->t('Also include plants marked as vegetables.'),
      '#default_value' => $config->get('filter_vegetable') ?? TRUE,
    ];

    $form['filter_settings']['skip_existing_herbs'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Skip existing herbs'),
      '#description' => $this->t('Skip importing plants that already exist in the herb content type (matched by scientific name or common name).'),
      '#default_value' => $config->get('skip_existing_herbs') ?? TRUE,
    ];

    $form['filter_settings']['filter_info'] = [
      '#type' => 'item',
      '#markup' => $this->t('<p><strong>Note:</strong> Plants are also matched against known medicinal plant families (Lamiaceae, Asteraceae, Apiaceae, Zingiberaceae, etc.) to include herbs with traditional medicinal uses even if not marked as edible.</p>'),
    ];

    $form['fallback_settings'] = [
      '#type' => 'details',
      '#title' => $this->t('Perenual Fallback'),
      '#open' => TRUE,
    ];

    $perenualEnabled = \Drupal::moduleHandler()->moduleExists('perenual_sync');

    $form['fallback_settings']['use_perenual_fallback'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Use Perenual as fallback data source'),
      '#description' => $perenualEnabled
        ? $this->t('After importing from Trefle, fill in missing fields with data from Perenual API.')
        : $this->t('Enable the Perenual Sync module to use this feature.'),
      '#default_value' => $config->get('use_perenual_fallback') ?? TRUE,
      '#disabled' => !$perenualEnabled,
    ];

    if ($perenualEnabled) {
      $form['fallback_settings']['fallback_info'] = [
        '#type' => 'item',
        '#markup' => $this->t('<p>Perenual provides additional data including: detailed descriptions, growing conditions, care level, and the <strong>medicinal</strong> flag. Configure Perenual at <a href=":url">Perenual Sync Settings</a>.</p>', [
          ':url' => '/admin/config/services/perenual-sync',
        ]),
      ];
    }

    $form['cron_settings'] = [
      '#type' => 'details',
      '#title' => $this->t('Automatic Sync (Cron)'),
      '#open' => TRUE,
    ];

    $form['cron_settings']['cron_enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable automatic sync via cron'),
      '#description' => $this->t('Automatically import herbs each time cron runs. Configure cron frequency in Drupal settings.'),
      '#default_value' => $config->get('cron_enabled'),
    ];

    $form['cron_settings']['cron_items_per_run'] = [
      '#type' => 'number',
      '#title' => $this->t('Items per cron run'),
      '#description' => $this->t('Number of plants to queue for import each time cron runs (1-50).'),
      '#default_value' => $config->get('cron_items_per_run') ?: 10,
      '#min' => 1,
      '#max' => 50,
      '#states' => [
        'visible' => [
          ':input[name="cron_enabled"]' => ['checked' => TRUE],
        ],
      ],
    ];

    $form['cron_settings']['cron_total_pages'] = [
      '#type' => 'number',
      '#title' => $this->t('Total pages to sync'),
      '#description' => $this->t('Limit the total number of API pages to sync (0 = unlimited). Each page contains ~20 plants.'),
      '#default_value' => $config->get('cron_total_pages') ?: 0,
      '#min' => 0,
      '#states' => [
        'visible' => [
          ':input[name="cron_enabled"]' => ['checked' => TRUE],
        ],
      ],
    ];

    $currentPage = $config->get('cron_current_page') ?: 1;
    $form['cron_settings']['cron_progress'] = [
      '#type' => 'item',
      '#title' => $this->t('Sync Progress'),
      '#markup' => $this->t('Currently on page @page.', ['@page' => $currentPage]),
      '#states' => [
        'visible' => [
          ':input[name="cron_enabled"]' => ['checked' => TRUE],
        ],
      ],
    ];

    $form['cron_settings']['reset_cron'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Reset sync progress'),
      '#description' => $this->t('Check this to restart the sync from page 1.'),
      '#default_value' => FALSE,
      '#states' => [
        'visible' => [
          ':input[name="cron_enabled"]' => ['checked' => TRUE],
        ],
      ],
    ];

    $form['logging_settings'] = [
      '#type' => 'details',
      '#title' => $this->t('Logging'),
      '#open' => FALSE,
    ];

    $form['logging_settings']['enable_logging'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable Logging'),
      '#description' => $this->t('Log sync operations to the Drupal watchdog.'),
      '#default_value' => $config->get('enable_logging'),
    ];

    // Show statistics.
    $stats = $this->trefleSyncService->getStats();
    $form['statistics'] = [
      '#type' => 'details',
      '#title' => $this->t('Statistics'),
      '#open' => FALSE,
    ];

    $form['statistics']['stats_display'] = [
      '#type' => 'item',
      '#markup' => $this->t('<strong>Total Synced:</strong> @total<br>
        <strong>Imported:</strong> @imported<br>
        <strong>Updated:</strong> @updated<br>
        <strong>Skipped:</strong> @skipped<br>
        <strong>Failed:</strong> @failed<br>
        <strong>Last Sync:</strong> @last<br>
        <strong>Rate Limit Remaining:</strong> @remaining/120', [
        '@total' => $stats['total_synced'],
        '@imported' => $stats['imported'],
        '@updated' => $stats['updated'],
        '@skipped' => $stats['skipped'] ?? 0,
        '@failed' => $stats['failed'],
        '@last' => $stats['last_sync'] ? date('Y-m-d H:i:s', $stats['last_sync']) : $this->t('Never'),
        '@remaining' => $stats['rate_limit_remaining'],
      ]),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * AJAX callback for testing API connection.
   */
  public function testConnectionCallback(array &$form, FormStateInterface $form_state): array {
    $result = $this->trefleSyncService->testConnection();

    return [
      '#type' => 'container',
      '#attributes' => ['id' => 'connection-test-result'],
      'message' => [
        '#type' => 'html_tag',
        '#tag' => 'div',
        '#attributes' => [
          'class' => [$result ? 'messages messages--status' : 'messages messages--error'],
        ],
        '#value' => $result
          ? $this->t('Connection successful! The Trefle API is accessible.')
          : $this->t('Connection failed. Please check your API key.'),
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    parent::validateForm($form, $form_state);

    $batchSize = $form_state->getValue('batch_size');
    if ($batchSize < 1 || $batchSize > 100) {
      $form_state->setErrorByName('batch_size', $this->t('Batch size must be between 1 and 100.'));
    }

    $cronItemsPerRun = $form_state->getValue('cron_items_per_run');
    if ($cronItemsPerRun < 1 || $cronItemsPerRun > 50) {
      $form_state->setErrorByName('cron_items_per_run', $this->t('Items per cron run must be between 1 and 50.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $config = $this->config('trefle_sync.settings')
      ->set('api_key_id', $form_state->getValue('api_key_id'))
      ->set('batch_size', (int) $form_state->getValue('batch_size'))
      ->set('sync_images', (bool) $form_state->getValue('sync_images'))
      ->set('update_existing', (bool) $form_state->getValue('update_existing'))
      ->set('enable_logging', (bool) $form_state->getValue('enable_logging'))
      ->set('filter_edible_only', (bool) $form_state->getValue('filter_edible_only'))
      ->set('filter_vegetable', (bool) $form_state->getValue('filter_vegetable'))
      ->set('skip_existing_herbs', (bool) $form_state->getValue('skip_existing_herbs'))
      ->set('use_perenual_fallback', (bool) $form_state->getValue('use_perenual_fallback'))
      ->set('cron_enabled', (bool) $form_state->getValue('cron_enabled'))
      ->set('cron_items_per_run', (int) $form_state->getValue('cron_items_per_run'))
      ->set('cron_total_pages', (int) $form_state->getValue('cron_total_pages'));

    // Reset cron progress if requested.
    if ($form_state->getValue('reset_cron')) {
      $config->set('cron_current_page', 1);
      $this->messenger()->addStatus($this->t('Sync progress has been reset to page 1.'));
    }

    $config->save();

    parent::submitForm($form, $form_state);
  }

}
