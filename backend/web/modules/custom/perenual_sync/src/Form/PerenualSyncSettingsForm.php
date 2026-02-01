<?php

declare(strict_types=1);

namespace Drupal\perenual_sync\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\key\KeyRepositoryInterface;
use Drupal\perenual_sync\PerenualSyncServiceInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Configuration form for Perenual Sync settings.
 */
class PerenualSyncSettingsForm extends ConfigFormBase {

  /**
   * The key repository.
   */
  protected KeyRepositoryInterface $keyRepository;

  /**
   * The Perenual sync service.
   */
  protected PerenualSyncServiceInterface $perenualSyncService;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    $instance = parent::create($container);
    $instance->keyRepository = $container->get('key.repository');
    $instance->perenualSyncService = $container->get('perenual_sync.service');
    return $instance;
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'perenual_sync_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['perenual_sync.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('perenual_sync.settings');

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
      '#description' => $this->t('Select the Key entity containing your Perenual API key. Get one at <a href="https://perenual.com/docs/api" target="_blank">perenual.com</a>. <a href=":url">Create a new key</a> if needed.', [
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
      '#description' => $this->t('Number of plants to process per batch (1-30). Note: Perenual free tier allows 100 requests/day.'),
      '#default_value' => $config->get('batch_size') ?: 20,
      '#min' => 1,
      '#max' => 30,
      '#required' => TRUE,
    ];

    $form['import_settings']['sync_images'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Sync Images'),
      '#description' => $this->t('Download and attach plant images from Perenual.'),
      '#default_value' => $config->get('sync_images'),
    ];

    $form['import_settings']['update_existing'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Update Existing Plants'),
      '#description' => $this->t('Update herb nodes that have already been imported from Perenual.'),
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
      '#description' => $this->t('Filter to only import plants with edible parts.'),
      '#default_value' => $config->get('filter_edible_only'),
    ];

    $form['filter_settings']['filter_medicinal'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Include medicinal plants'),
      '#description' => $this->t('Include plants marked as medicinal in Perenual (uses the medicinal field).'),
      '#default_value' => $config->get('filter_medicinal') ?? TRUE,
    ];

    $form['filter_settings']['skip_existing_herbs'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Skip existing herbs'),
      '#description' => $this->t('Skip importing plants that already exist (matched by scientific name or common name).'),
      '#default_value' => $config->get('skip_existing_herbs') ?? TRUE,
    ];

    $form['fallback_settings'] = [
      '#type' => 'details',
      '#title' => $this->t('Fallback/Enrichment'),
      '#open' => TRUE,
    ];

    $form['fallback_settings']['use_as_fallback'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Use as fallback for Trefle'),
      '#description' => $this->t('When enabled, Perenual will be used to fill in missing data for herbs imported from Trefle.'),
      '#default_value' => $config->get('use_as_fallback') ?? TRUE,
    ];

    $form['fallback_settings']['fallback_info'] = [
      '#type' => 'item',
      '#markup' => $this->t('<p><strong>How fallback works:</strong> After importing a plant from Trefle, empty fields will be populated with data from Perenual if available. This includes description, growing conditions, images, and more.</p>'),
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

    // Statistics.
    $stats = $this->perenualSyncService->getStats();
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
        <strong>Enriched:</strong> @enriched<br>
        <strong>Skipped:</strong> @skipped<br>
        <strong>Failed:</strong> @failed<br>
        <strong>Last Sync:</strong> @last<br>
        <strong>API Requests Today:</strong> @remaining remaining of 100', [
        '@total' => $stats['total_synced'],
        '@imported' => $stats['imported'],
        '@updated' => $stats['updated'],
        '@enriched' => $stats['enriched'] ?? 0,
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
    $result = $this->perenualSyncService->testConnection();

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
          ? $this->t('Connection successful! The Perenual API is accessible.')
          : $this->t('Connection failed. Please check your API key.'),
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $this->config('perenual_sync.settings')
      ->set('api_key_id', $form_state->getValue('api_key_id'))
      ->set('batch_size', (int) $form_state->getValue('batch_size'))
      ->set('sync_images', (bool) $form_state->getValue('sync_images'))
      ->set('update_existing', (bool) $form_state->getValue('update_existing'))
      ->set('enable_logging', (bool) $form_state->getValue('enable_logging'))
      ->set('filter_edible_only', (bool) $form_state->getValue('filter_edible_only'))
      ->set('filter_medicinal', (bool) $form_state->getValue('filter_medicinal'))
      ->set('skip_existing_herbs', (bool) $form_state->getValue('skip_existing_herbs'))
      ->set('use_as_fallback', (bool) $form_state->getValue('use_as_fallback'))
      ->save();

    parent::submitForm($form, $form_state);
  }

}
