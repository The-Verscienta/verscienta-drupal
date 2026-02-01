<?php

declare(strict_types=1);

namespace Drupal\perenual_sync\Controller;

use Drupal\Core\Access\CsrfTokenGenerator;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Drupal\node\NodeInterface;
use Drupal\perenual_sync\PerenualSyncServiceInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Controller for Perenual sync import actions.
 */
class PerenualSyncController extends ControllerBase {

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
   * Import a single plant from Perenual.
   */
  public function import(string $perenual_id, Request $request): RedirectResponse {
    $perenualId = (int) $perenual_id;

    // Validate CSRF token.
    $token = $request->query->get('token');
    if (!$token || !$this->csrfToken->validate($token, 'perenual_sync.import.' . $perenualId)) {
      throw new AccessDeniedHttpException('Invalid CSRF token.');
    }

    try {
      $node = $this->perenualSyncService->importPlant($perenualId);

      if ($node) {
        $this->messenger()->addStatus($this->t('Successfully imported plant: @title', [
          '@title' => $node->getTitle(),
        ]));

        return new RedirectResponse(
          Url::fromRoute('entity.node.edit_form', ['node' => $node->id()])->toString()
        );
      }
      else {
        $existing = $this->perenualSyncService->findExistingHerb($perenualId);
        if ($existing) {
          $this->messenger()->addWarning($this->t('Plant already exists and update is disabled.'));
        }
        else {
          $this->messenger()->addError($this->t('Failed to import plant. Check the logs for details.'));
        }
      }
    }
    catch (\Exception $e) {
      $this->messenger()->addError($this->t('Import failed: @message', [
        '@message' => $e->getMessage(),
      ]));
    }

    return new RedirectResponse(
      Url::fromRoute('perenual_sync.search')->toString()
    );
  }

  /**
   * Enrich an existing herb node with Perenual data.
   */
  public function enrich(NodeInterface $node, Request $request): RedirectResponse {
    // Validate CSRF token.
    $token = $request->query->get('token');
    if (!$token || !$this->csrfToken->validate($token, 'perenual_sync.enrich.' . $node->id())) {
      throw new AccessDeniedHttpException('Invalid CSRF token.');
    }

    try {
      $enriched = $this->perenualSyncService->enrichHerbNode($node);

      if ($enriched) {
        $this->messenger()->addStatus($this->t('Successfully enriched herb "@title" with Perenual data.', [
          '@title' => $node->getTitle(),
        ]));
      }
      else {
        $this->messenger()->addWarning($this->t('No additional data found in Perenual for "@title".', [
          '@title' => $node->getTitle(),
        ]));
      }
    }
    catch (\Exception $e) {
      $this->messenger()->addError($this->t('Enrichment failed: @message', [
        '@message' => $e->getMessage(),
      ]));
    }

    return new RedirectResponse(
      Url::fromRoute('entity.node.edit_form', ['node' => $node->id()])->toString()
    );
  }

}
