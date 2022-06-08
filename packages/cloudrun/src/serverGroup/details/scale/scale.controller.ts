import type { IController } from 'angular';
import { copy, module } from 'angular';
import type { IModalServiceInstance } from 'angular-ui-bootstrap';

import type { Application } from '@spinnaker/core';
import { ManifestWriter, TaskMonitor } from '@spinnaker/core';
import { KUBERNETES_SCALE_MANIFEST_SETTINGS_FORM } from './scaleSettingsForm.component';

interface IScaleCommand {
  manifestName: string;
  location: string;
  account: string;
  reason: string;
  replicas: number;
}

interface IManifestCoordinates {
  name: string;
  namespace: string;
  account: string;
}

class KubernetesManifestScaleController implements IController {
  public taskMonitor: TaskMonitor;
  public command: IScaleCommand;
  public verification = {
    verified: false,
  };

  public static $inject = ['coordinates', 'currentReplicas', '$uibModalInstance', 'application'];
  constructor(
    coordinates: IManifestCoordinates,
    currentReplicas: number,
    private $uibModalInstance: IModalServiceInstance,
    private application: Application,
  ) {
    this.taskMonitor = new TaskMonitor({
      title: `Scaling ${coordinates.name} in ${coordinates.namespace}`,
      application,
      modalInstance: $uibModalInstance,
    });

    this.command = {
      manifestName: coordinates.name,
      location: coordinates.namespace,
      account: coordinates.account,
      reason: null,
      replicas: currentReplicas,
    };
  }

  public isValid(): boolean {
    return this.verification.verified;
  }

  public cancel(): void {
    this.$uibModalInstance.dismiss();
  }

  public scale(): void {
    this.taskMonitor.submit(() => {
      const payload = copy(this.command) as any;
      payload.cloudProvider = 'kubernetes';

      return ManifestWriter.scaleManifest(payload, this.application);
    });
  }
}

export const KUBERNETES_MANIFEST_SCALE_CTRL = 'spinnaker.kubernetes.v2.manifest.scale.controller';

module(KUBERNETES_MANIFEST_SCALE_CTRL, [KUBERNETES_SCALE_MANIFEST_SETTINGS_FORM]).controller(
  'kubernetesV2ManifestScaleCtrl',
  KubernetesManifestScaleController,
);
