<?php

declare(strict_types=1);

namespace Drupal\perenual_sync\Form;

use Drupal\Core\Access\CsrfTokenGenerator;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\perenual_sync\PerenualSyncServiceInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Form for searching and importing plants from Perenual.
 */
class PerenualSyncSearchForm extends FormBase {

  protected PerenualSyncServiceInterface $perenualSyncService;
  protected CsrfTokenGenerator $csrfToken;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    $instance = new static();
    $instance->perenualSyncService = $container->get('perenual_sync.service');
    $instance->csrfToken = $container->get('csrf_token');
    return $instance;
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'perenual_sync_search';
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

    $results = $form_state->get('search_results');
    if ($results !== NULL) {
      $form['results'] = $this->buildResultsTable($results, $form_state);
    }

    return $form;
  }

  /**
   * Build the results table.
   */
  protected function buildResultsTable(array $results, FormStateInterface $form_state): array {
    $plants = $results['data'] ?? [];

    if (empty($plants)) {
      return [
        '#markup' => '<p>' . $this->t('No plants found matching your search.') . '</p>',
      ];
    }

    $header = [
      $this->t('Image'),
      $this->t('Common Name'),
      $this->t('Scientific Name'),
      $this->t('Cycle'),
      $this->t('Medicinal'),
      $this->t('Status'),
      $this->t('Actions'),
    ];

    $rows = [];
    foreach ($plants as $plant) {
      $perenualId = $plant['id'] ?? 0;
      $existingNode = $this->perenualSyncService->findExistingHerbByName($plant);

      // Image.
      $defaultImage = $plant['default_image'] ?? [];
      $imageUrl = $defaultImage['thumbnail'] ?? $defaultImage['small_url'] ?? NULL;
      if ($imageUrl && filter_var($imageUrl, FILTER_VALIDATE_URL)) {
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

      // Medicinal indicator.
      $medicinal = !empty($plant['medicinal']) && $plant['medicinal'] === TRUE
        ? $this->t('Yes')
        : $this->t('No');

      // Status.
      if ($existingNode) {
        $status = [
          'data' => [
            '#type' => 'inline_template',
            '#template' => '<span class="color-success">{{ imported }}</span> - <a href="{{ url }}">{{ view }}</a>',
            '#context' => [
              'imported' => $this->t('Exists'),
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
      $importUrl = Url::fromRoute('perenual_sync.import', ['perenual_id' => $perenualId], [
        'query' => [
          'token' => $this->csrfToken->get('perenual_sync.import.' . $perenualId),
        ],
      ]);
      $importText = $existingNode ? $this->t('Update') : $this->t('Import');

      // Sanitize text.
      $commonName = htmlspecialchars($plant['common_name'] ?? '-', ENT_QUOTES, 'UTF-8');
      $scientificName = is_array($plant['scientific_name'] ?? NULL)
        ? htmlspecialchars($plant['scientific_name'][0] ?? '-', ENT_QUOTES, 'UTF-8')
        : htmlspecialchars($plant['scientific_name'] ?? '-', ENT_QUOTES, 'UTF-8');
      $cycle = htmlspecialchars(ucfirst($plant['cycle'] ?? '-'), ENT_QUOTES, 'UTF-8');

      $rows[] = [
        $image,
        $commonName,
        $scientificName,
        $cycle,
        $medicinal,
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

    $total = $results['total'] ?? count($plants);
    $lastPage = $results['last_page'] ?? 1;
    $currentPage = (int) ($form_state->getValue('page') ?: 1);

    $build['summary'] = [
      '#markup' => '<p>' . $this->t('Found @total plants (page @page of @pages)', [
        '@total' => $total,
        '@page' => $currentPage,
        '@pages' => $lastPage,
      ]) . '</p>',
    ];

    $build['table'] = [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
      '#empty' => $this->t('No results found.'),
    ];

    // Pagination.
    if ($lastPage > 1) {
      $build['pager'] = [
        '#type' => 'container',
        '#attributes' => ['class' => ['perenual-pager']],
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
          '@total' => $lastPage,
        ]) . '</span>',
      ];

      if ($currentPage < $lastPage) {
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
      $results = $this->perenualSyncService->searchPlants($query, $page);
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
