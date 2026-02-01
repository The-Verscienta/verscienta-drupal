<?php

declare(strict_types=1);

namespace Drupal\trefle_sync\Form;

use Drupal\Core\Access\CsrfTokenGenerator;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\trefle_sync\TrefleSyncServiceInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Form for searching and importing plants from Trefle.
 */
class TrefleSyncSearchForm extends FormBase {

  /**
   * The Trefle sync service.
   *
   * @var \Drupal\trefle_sync\TrefleSyncServiceInterface
   */
  protected TrefleSyncServiceInterface $trefleSyncService;

  /**
   * The CSRF token generator.
   *
   * @var \Drupal\Core\Access\CsrfTokenGenerator
   */
  protected CsrfTokenGenerator $csrfToken;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    $instance = new static();
    $instance->trefleSyncService = $container->get('trefle_sync.service');
    $instance->csrfToken = $container->get('csrf_token');
    return $instance;
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'trefle_sync_search';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form['search'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['container-inline']],
    ];

    $form['search']['query'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Plant Name'),
      '#title_display' => 'invisible',
      '#placeholder' => $this->t('Search plants by name...'),
      '#size' => 40,
      '#default_value' => $form_state->getValue('query') ?: '',
    ];

    $form['search']['page'] = [
      '#type' => 'hidden',
      '#default_value' => $form_state->getValue('page') ?: 1,
    ];

    $form['search']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Search'),
      '#button_type' => 'primary',
    ];

    // Display search results.
    $results = $form_state->get('search_results');
    if ($results !== NULL) {
      $form['results'] = $this->buildResultsTable($results, $form_state);
    }

    return $form;
  }

  /**
   * Build the results table.
   *
   * @param array $results
   *   The search results from Trefle API.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   *
   * @return array
   *   The render array for the results table.
   */
  protected function buildResultsTable(array $results, FormStateInterface $form_state): array {
    $plants = $results['data'] ?? [];
    $meta = $results['meta'] ?? [];

    if (empty($plants)) {
      return [
        '#markup' => '<p>' . $this->t('No plants found matching your search.') . '</p>',
      ];
    }

    $header = [
      $this->t('Image'),
      $this->t('Common Name'),
      $this->t('Scientific Name'),
      $this->t('Family'),
      $this->t('Status'),
      $this->t('Actions'),
    ];

    $rows = [];
    foreach ($plants as $plant) {
      $trefleId = $plant['id'] ?? 0;
      $existingNode = $this->trefleSyncService->findExistingHerb($trefleId);

      // Image - sanitize URL from external API.
      $imageUrl = $plant['image_url'] ?? NULL;
      if ($imageUrl && filter_var($imageUrl, FILTER_VALIDATE_URL) && preg_match('/^https?:\/\//', $imageUrl)) {
        $image = [
          'data' => [
            '#type' => 'html_tag',
            '#tag' => 'img',
            '#attributes' => [
              'src' => $imageUrl,
              'alt' => '',
              'style' => 'max-width: 60px; max-height: 60px;',
              'loading' => 'lazy',
            ],
          ],
        ];
      }
      else {
        $image = '';
      }

      // Status.
      if ($existingNode) {
        $status = [
          'data' => [
            '#type' => 'inline_template',
            '#template' => '<span class="color-success">{{ imported }}</span> - <a href="{{ url }}">{{ view }}</a>',
            '#context' => [
              'imported' => $this->t('Imported'),
              'url' => $existingNode->toUrl()->toString(),
              'view' => $this->t('View'),
            ],
          ],
        ];
      }
      else {
        $status = [
          'data' => [
            '#type' => 'html_tag',
            '#tag' => 'span',
            '#attributes' => ['class' => ['color-warning']],
            '#value' => $this->t('Not imported'),
          ],
        ];
      }

      // Import action with CSRF token.
      $importUrl = Url::fromRoute('trefle_sync.import', ['trefle_id' => $trefleId], [
        'query' => [
          'token' => $this->csrfToken->get('trefle_sync.import.' . $trefleId),
        ],
      ]);
      $importText = $existingNode ? $this->t('Update') : $this->t('Import');

      // Sanitize text from external API.
      $commonName = htmlspecialchars($plant['common_name'] ?? '-', ENT_QUOTES, 'UTF-8');
      $scientificName = htmlspecialchars($plant['scientific_name'] ?? '-', ENT_QUOTES, 'UTF-8');
      $family = htmlspecialchars($plant['family'] ?? '-', ENT_QUOTES, 'UTF-8');

      $rows[] = [
        $image,
        $commonName,
        $scientificName,
        $family,
        $status,
        [
          'data' => [
            '#type' => 'link',
            '#title' => $importText,
            '#url' => $importUrl,
            '#attributes' => [
              'class' => ['button', 'button--small'],
            ],
          ],
        ],
      ];
    }

    $build = [
      '#type' => 'container',
    ];

    $build['summary'] = [
      '#markup' => '<p>' . $this->t('Found @total plants (showing page @page of @pages)', [
        '@total' => $meta['total'] ?? count($plants),
        '@page' => $form_state->getValue('page') ?: 1,
        '@pages' => ceil(($meta['total'] ?? count($plants)) / 20),
      ]) . '</p>',
    ];

    $build['table'] = [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
      '#empty' => $this->t('No results found.'),
      '#attributes' => ['class' => ['trefle-results-table']],
    ];

    // Pagination.
    $totalPages = ceil(($meta['total'] ?? count($plants)) / 20);
    $currentPage = (int) ($form_state->getValue('page') ?: 1);

    if ($totalPages > 1) {
      $build['pager'] = [
        '#type' => 'container',
        '#attributes' => ['class' => ['trefle-pager']],
      ];

      if ($currentPage > 1) {
        $build['pager']['prev'] = [
          '#type' => 'submit',
          '#value' => $this->t('Previous'),
          '#name' => 'prev',
          '#submit' => ['::pagerSubmit'],
        ];
      }

      $build['pager']['info'] = [
        '#markup' => '<span style="margin: 0 10px;">' . $this->t('Page @current of @total', [
          '@current' => $currentPage,
          '@total' => $totalPages,
        ]) . '</span>',
      ];

      if ($currentPage < $totalPages) {
        $build['pager']['next'] = [
          '#type' => 'submit',
          '#value' => $this->t('Next'),
          '#name' => 'next',
          '#submit' => ['::pagerSubmit'],
        ];
      }
    }

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $query = trim($form_state->getValue('query'));
    $page = (int) ($form_state->getValue('page') ?: 1);

    if (empty($query)) {
      $this->messenger()->addWarning($this->t('Please enter a search term.'));
      return;
    }

    try {
      $results = $this->trefleSyncService->searchPlants($query, $page);
      $form_state->set('search_results', $results);
      $form_state->setRebuild();
    }
    catch (\Exception $e) {
      $this->messenger()->addError($this->t('Search failed: @message', [
        '@message' => $e->getMessage(),
      ]));
    }
  }

  /**
   * Submit handler for pagination.
   */
  public function pagerSubmit(array &$form, FormStateInterface $form_state): void {
    $triggering = $form_state->getTriggeringElement();
    $currentPage = (int) ($form_state->getValue('page') ?: 1);

    if ($triggering['#name'] === 'prev') {
      $form_state->setValue('page', max(1, $currentPage - 1));
    }
    elseif ($triggering['#name'] === 'next') {
      $form_state->setValue('page', $currentPage + 1);
    }

    $this->submitForm($form, $form_state);
  }

}
