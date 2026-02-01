<?php

declare(strict_types=1);

namespace Drupal\trefle_sync\Controller;

use Drupal\Core\Access\CsrfTokenGenerator;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Drupal\trefle_sync\TrefleSyncServiceInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Controller for Trefle sync import actions.
 */
class TrefleSyncController extends ControllerBase {

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
   * Import a single plant from Trefle.
   *
   * @param string $trefle_id
   *   The Trefle plant ID.
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The current request.
   *
   * @return \Symfony\Component\HttpFoundation\RedirectResponse
   *   Redirect to the search page or the imported node.
   */
  public function import(string $trefle_id, Request $request): RedirectResponse {
    $trefleId = (int) $trefle_id;

    // Validate CSRF token.
    $token = $request->query->get('token');
    if (!$token || !$this->csrfToken->validate($token, 'trefle_sync.import.' . $trefleId)) {
      throw new AccessDeniedHttpException('Invalid CSRF token.');
    }

    try {
      $node = $this->trefleSyncService->importPlant($trefleId);

      if ($node) {
        $this->messenger()->addStatus($this->t('Successfully imported plant: @title', [
          '@title' => $node->getTitle(),
        ]));

        // Redirect to the node edit page.
        return new RedirectResponse(
          Url::fromRoute('entity.node.edit_form', ['node' => $node->id()])->toString()
        );
      }
      else {
        $existing = $this->trefleSyncService->findExistingHerb($trefleId);
        if ($existing) {
          $this->messenger()->addWarning($this->t('Plant already exists and update is disabled. <a href=":url">View existing</a>.', [
            ':url' => $existing->toUrl()->toString(),
          ]));
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

    // Redirect back to search page.
    return new RedirectResponse(
      Url::fromRoute('trefle_sync.search')->toString()
    );
  }

}
