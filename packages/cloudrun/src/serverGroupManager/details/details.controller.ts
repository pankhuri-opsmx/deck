/* import type { StateService } from '@uirouter/angularjs';
import type { IController, IScope } from 'angular';
import { module } from 'angular';
import type { IModalService } from 'angular-ui-bootstrap';
//import { orderBy } from 'lodash';

import type {
  Application,
  IManifest,
  IOwnerOption,
  IServerGroupManager,
  IServerGroupManagerStateParams,
} from '@spinnaker/core';
import { ClusterTargetBuilder, ManifestReader, SETTINGS } from '@spinnaker/core';

import type { ICloudrunServerGroupManager } from '../../interfaces';
import { CloudrunManifestCommandBuilder } from '../../serverGroup/configure/serverGroupCommandBuilder.service';
import { ManifestWizard } from '../../serverGroup/configure/wizard/serverGroupWizard';

class CloudrunServerGroupManagerDetailsController implements IController {
  public serverGroupManager: ICloudrunServerGroupManager;
  public state = { loading: true };
  public manifest: IManifest;
  public entityTagTargets: IOwnerOption[];

  public static $inject = ['serverGroupManager', '$scope', '$uibModal', 'app', '$state'];
  constructor(
    serverGroupManager: IServerGroupManagerStateParams,
    private $scope: IScope,
    private $uibModal: IModalService,
    public app: Application,
    private $state: StateService,
  ) {
    const dataSource = this.app.getDataSource('serverGroupManagers');
    dataSource
      .ready()
      .then(() => {
        this.extractServerGroupManager(serverGroupManager);
        this.$scope.isDisabled = !SETTINGS.cloudrunAdHocInfraWritesEnabled;
        dataSource.onRefresh(this.$scope, () => this.extractServerGroupManager(serverGroupManager));
      })
      .catch(() => this.autoClose());
    this.$scope.isDisabled = !SETTINGS.cloudrunAdHocInfraWritesEnabled;
  }





  public canUndoRolloutServerGroupManager(): boolean {
    return (
      this.serverGroupManager && this.serverGroupManager.serverGroups && this.serverGroupManager.serverGroups.length > 0
    );
  }



  public scaleServerGroupManager(): void {
    this.$uibModal.open({
      templateUrl: require('../../serverGroup/details/scale/scale.html'),
      controller: 'cloudrunV2ManifestScaleCtrl',
      controllerAs: 'ctrl',
      resolve: {
        coordinates: {
          name: this.serverGroupManager.name,
          namespace: this.serverGroupManager.namespace,
          account: this.serverGroupManager.account,
        },
        currentReplicas: this.manifest.manifest.spec.replicas,
        application: this.app,
      },
    });
  }

  public editServerGroupManager(): void {
    CloudrunManifestCommandBuilder.buildNewManifestCommand(
      this.app,
      this.manifest.manifest,
     // this.serverGroupManager.moniker,
     // this.serverGroupManager.account,
      'edit'
    ).then((builtCommand) => {
      ManifestWizard.show({ title: 'Edit Manifest', application: this.app, command: builtCommand });
    });
  }


  private extractServerGroupManager({ accountId, region, serverGroupManager }: IServerGroupManagerStateParams): void {
    const serverGroupManagerDetails = this.app
      .getDataSource('serverGroupManagers')
      .data.find(
        (manager: IServerGroupManager) =>
          manager.name === serverGroupManager && manager.region === region && manager.account === accountId,
      );

    if (!serverGroupManagerDetails) {
      return this.autoClose();
    }

    ManifestReader.getManifest(accountId, region, serverGroupManager).then((manifest: IManifest) => {
      this.manifest = manifest;
      this.serverGroupManager = serverGroupManagerDetails;
      this.entityTagTargets = this.configureEntityTagTargets();
      this.state.loading = false;
    });
  }

  private configureEntityTagTargets(): IOwnerOption[] {
    return ClusterTargetBuilder.buildManagerClusterTargets(this.serverGroupManager);
  }

  private autoClose(): void {
    if (this.$scope.$$destroyed) {
      return;
    } else {
      this.$state.params.allowModalToStayOpen = true;
      this.$state.go('^', null, { location: 'replace' });
    }
  }
}

export const CLOUDRUN_SERVER_GROUP_MANAGER_DETAILS_CTRL =
  'spinnaker.cloudrun.serverGroupManager.details.controller';
module(CLOUDRUN_SERVER_GROUP_MANAGER_DETAILS_CTRL, []).controller(
  'cloudrunV2ServerGroupManagerDetailsCtrl',
  CloudrunServerGroupManagerDetailsController,
);
 */
