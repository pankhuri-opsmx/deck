//import type { StateService } from '@uirouter/angularjs';
//import type { IController, IQService, IScope } from 'angular';
import type { IController, IScope } from 'angular';
import { module } from 'angular';
import { cloneDeep, map, mapValues, reduce } from 'lodash';

//import type { IModalService } from 'angular-ui-bootstrap';
import type {
  Application,
  IConfirmationModalParams,
  ILoadBalancer,
  IServerGroup,
  ServerGroupWriter,
} from '@spinnaker/core';
//import { ClusterTargetBuilder, ManifestReader, SERVER_GROUP_WRITER, ServerGroupReader, SETTINGS } from '@spinnaker/core';
import {
  ConfirmationModalService,
  SERVER_GROUP_WRITER,
  ServerGroupReader,
  ServerGroupWarningMessageService,
} from '@spinnaker/core';

import { CloudrunHealth } from '../../common/cloudrunHealth';
import type { ICloudrunLoadBalancer } from '../../common/domain/ICloudrunLoadBalancer';
//import type { CloudrunManifestCommandBuilder } from '../configure/serverGroupCommandBuilder.service';
//import { ManifestTrafficService } from '../../manifest/traffic/ManifestTrafficService';
//import { ManifestWizard } from '../configure/wizard/serverGroupWizard';
import type { ICloudrunServerGroup } from '../../interfaces';

interface IServerGroupFromStateParams {
  accountId: string;
  region: string;
  name: string;
}

class CloudrunServerGroupDetailsController implements IController {
  public state = { loading: true };
  public serverGroup: ICloudrunServerGroup;
  //public manifest: IManifest;
  /*   public entityTagTargets: IOwnerOption[];

  public static $inject = ['serverGroup', 'app', '$uibModal', '$scope', '$state'];
  constructor(
    serverGroup: IServerGroupFromStateParams,
    public app: Application,
    private $uibModal: IModalService,
    private $scope: IScope,
    private $state: StateService,
    
  ) {
    const dataSource = this.app.getDataSource('serverGroups');
    dataSource
      .ready()
      .then(() => {
        this.extractServerGroup(serverGroup);
        this.$scope.isDisabled = !SETTINGS.cloudrunAdHocInfraWritesEnabled;
        dataSource.onRefresh(this.$scope, () => this.extractServerGroup(serverGroup));
      })
      .catch(() => this.autoClose());
  }
 */

  private static buildExpectedAllocationsTable(expectedAllocations: { [key: string]: number }): string {
    const tableRows = map(expectedAllocations, (allocation, serverGroupName) => {
      return `
        <tr>
          <td>${serverGroupName}</td>
          <td>${allocation * 100}%</td>
        </tr>`;
    }).join('');

    return `
      <table class="table table-condensed">
        <thead>
          <tr>
            <th>Server Group</th>
            <th>Allocation</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>`;
  }

  public static $inject = [
    '$state',
    '$scope',
    //'$uibModal',
    'serverGroup',
    'app',
    'serverGroupWriter',
    /*   ,
    'cloudrunServerGroupWriter',
    'cloudrunServerGroupCommandBuilder', */
  ];
  constructor(
    private $state: any,
    private $scope: IScope,
    // private $uibModal: IModalService,
    serverGroup: IServerGroupFromStateParams,
    public app: Application,
    private serverGroupWriter: ServerGroupWriter,
  ) /*   
    private cloudrunServerGroupWriter: CloudrunServerGroupWriter,
    private cloudrunServerGroupCommandBuilder: CloudrunManifestCommandBuilder ,
 */ {
    // eslint-disable-next-line no-debugger
    debugger;
    /*   this.app
     // .ready()
      .then(() =>  */ this.extractServerGroup(serverGroup)
      .then(() => {
        if (!this.$scope.$$destroyed) {
          // eslint-disable-next-line no-console
          console.log(this.$scope.$$destroyed);
          this.app.getDataSource('serverGroups').onRefresh(this.$scope, () => this.extractServerGroup(serverGroup));
        }
      })
      .catch(() => this.autoClose());
  }
  /*   private ownerReferences(): any[] {
    const manifest = this.manifest.manifest;
    if (
      manifest != null &&
      manifest.hasOwnProperty('metadata') &&
      manifest.metadata.hasOwnProperty('ownerReferences') &&
      Array.isArray(manifest.metadata.ownerReferences)
    ) {
      return manifest.metadata.ownerReferences;
    } else {
      return [] as any[];
    }
  } */

  /* private ownerIsController(ownerReference: any): boolean {
    return ownerReference.hasOwnProperty('controller') && ownerReference.controller === true;
  }

  private lowerCaseFirstLetter(s: string): string {
    return s.charAt(0).toLowerCase() + s.slice(1);
  }

  public manifestController(): string {
    const controller = this.ownerReferences().find(this.ownerIsController);
    if (typeof controller === 'undefined') {
      return null;
    } else {
      return this.lowerCaseFirstLetter(controller.kind) + ' ' + controller.name;
    }
  } */

  /* public canScaleServerGroup(): boolean {
    return this.serverGroup.kind !== 'DaemonSet' && this.manifestController() === null;
  } */

  /*   public scaleServerGroup(): void {
    this.$uibModal.open({
      templateUrl: require('./scale/scale.html'),
      controller: 'cloudrunV2ManifestScaleCtrl',
      controllerAs: 'ctrl',
      resolve: {
        coordinates: {
          name: this.serverGroup.name,
          namespace: this.serverGroup.namespace,
          account: this.serverGroup.account,
        },
        currentReplicas: this.manifest.manifest.spec.replicas,
        application: this.app,
      },
    });
  }  */

  /*   public canEditServerGroup(): boolean {
    return this.manifestController() === null;
  }
 */
  /*  public editServerGroup(): void {
    CloudrunManifestCommandBuilder.buildNewManifestCommand(
      this.app,
     // this.manifest.manifest,
     // this.serverGroup.moniker,
     // this.serverGroup.account,
      'edit'
    ).then((builtCommand) => {
      ManifestWizard.show({ title: 'Edit Manifest', application: this.app, command: builtCommand });
    });
  }
 */

  //public canDisable = () => ManifestTrafficService.canDisableServerGroup(this.serverGroup);

  /* public disableServerGroup = (): void => {
    ConfirmationModalService.confirm({
      header: `Really disable ${this.manifest.name}?`,
      buttonText: 'Disable',
      askForReason: true,
      submitJustWithReason: true,
      submitMethod: ({ reason }: { reason: string }) => ManifestTrafficService.disable(this.manifest, this.app, reason),
      taskMonitorConfig: {
        application: this.app,
        title: `Disabling ${this.manifest.name}`,
        onTaskComplete: () => this.app.getDataSource('serverGroups').refresh(),
      },
    });
  }; */

  // public canEnable = () => ManifestTrafficService.canEnableServerGroup(this.serverGroup);

  /*  public enableServerGroup = (): void => {
    ConfirmationModalService.confirm({
      header: `Really enable ${this.manifest.name}?`,
      buttonText: 'Enable',
      askForReason: true,
      submitJustWithReason: true,
      submitMethod: ({ reason }: { reason: string }) => ManifestTrafficService.enable(this.manifest, this.app, reason),
      taskMonitorConfig: {
        application: this.app,
        title: `Enabling ${this.manifest.name}`,
        onTaskComplete: () => this.app.getDataSource('serverGroups').refresh(),
      },
    });
  };
 */

  private expectedAllocationsAfterDisableOperation(
    serverGroup: IServerGroup,
    app: Application,
  ): { [key: string]: number } {
    const loadBalancer = app.getDataSource('loadBalancers').data.find((toCheck: ICloudrunLoadBalancer): boolean => {
      const allocations = toCheck.split?.allocations ?? {};
      const enabledServerGroups = Object.keys(allocations);
      return enabledServerGroups.includes(serverGroup.name);
    });

    if (loadBalancer) {
      let allocations = cloneDeep(loadBalancer.split.allocations);
      delete allocations[serverGroup.name];
      const denominator = reduce(allocations, (partialSum: number, allocation: number) => partialSum + allocation, 0);
      // const precision = loadBalancer.split.shardBy === 'COOKIE' ? 1000 : 100;
      allocations = mapValues(allocations, (allocation) => Math.round(allocation / denominator));
      return allocations;
    } else {
      return null;
    }
  }

  public canDestroyServerGroup(): boolean {
    if (this.serverGroup) {
      if (this.serverGroup.disabled) {
        return true;
      }

      const expectedAllocations = this.expectedAllocationsAfterDisableOperation(this.serverGroup, this.app);
      if (expectedAllocations) {
        return Object.keys(expectedAllocations).length > 0;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public destroyServerGroup(): void {
    const stateParams = {
      name: this.serverGroup.name,
      accountId: this.serverGroup.account,
      region: this.serverGroup.region,
    };

    const taskMonitor = {
      application: this.app,
      title: 'Destroying ' + this.serverGroup.name,
      onTaskComplete: () => {
        if (this.$state.includes('**.serverGroup', stateParams)) {
          this.$state.go('^');
        }
      },
    };

    const submitMethod = (params: any) => this.serverGroupWriter.destroyServerGroup(this.serverGroup, this.app, params);

    const confirmationModalParams = {
      header: 'Really destroy ' + this.serverGroup.name + '?',
      buttonText: 'Destroy ' + this.serverGroup.name,
      account: this.serverGroup.account,
      taskMonitorConfig: taskMonitor,
      submitMethod,
      askForReason: true,
      platformHealthOnlyShowOverride: this.app.attributes.platformHealthOnlyShowOverride,
      platformHealthType: CloudrunHealth.PLATFORM,
      body: this.getBodyTemplate(this.serverGroup, this.app),
      interestingHealthProviderNames: [] as string[],
    };

    if (this.app.attributes.platformHealthOnlyShowOverride && this.app.attributes.platformHealthOnly) {
      confirmationModalParams.interestingHealthProviderNames = [CloudrunHealth.PLATFORM];
    }

    ConfirmationModalService.confirm(confirmationModalParams);
  }

  private getBodyTemplate(serverGroup: ICloudrunServerGroup, app: Application): string {
    let template = '';
    const params: IConfirmationModalParams = {};
    ServerGroupWarningMessageService.addDestroyWarningMessage(app, serverGroup, params);
    if (params.body) {
      template += params.body;
    }

    if (!serverGroup.disabled) {
      const expectedAllocations = this.expectedAllocationsAfterDisableOperation(serverGroup, app);

      template += `
        <div class="well well-sm">
          <p>
            A destroy operation will first disable this server group.
          </p>
          <p>
            For App Engine, a disable operation sets this server group's allocation
            to 0% and sets the other enabled server groups' allocations to their relative proportions
            before the disable operation. The approximate allocations that will result from this operation are shown below.
          </p>
          <p>
            If you would like more fine-grained control over your server groups' allocations,
            edit <b>${serverGroup.loadBalancers[0]}</b> under the <b>Load Balancers</b> tab.
          </p>
          <div class="row">
            <div class="col-md-12">
              ${CloudrunServerGroupDetailsController.buildExpectedAllocationsTable(expectedAllocations)}
            </div>
          </div>
        </div>
      `;
    }

    return template;
  }

  private autoClose(): void {
    if (this.$scope.$$destroyed) {
      return;
    } else {
      this.$state.params.allowModalToStayOpen = true;
      this.$state.go('^', null, { location: 'replace' });
    }
  }

  private extractServerGroup({ name, accountId, region }: IServerGroupFromStateParams): PromiseLike<void> {
    // eslint-disable-next-line no-debugger
    debugger;
    /*   this.$q
      .all([
        ServerGroupReader.getServerGroup(this.app.name, accountId, region, name),
        //ManifestReader.getManifest(accountId, region, name),
      ])
      .then((serverGroupDetails : IServerGroup) => {
        if (!serverGroupDetails) {
          return this.autoClose();
        }
        this.serverGroup = serverGroupDetails as ICloudrunServerGroup;
        this.entityTagTargets = this.configureEntityTagTargets();
        this.manifest = manifest;
        this.state.loading = false;
      }); */

    return ServerGroupReader.getServerGroup(this.app.name, accountId, region, name).then(
      (serverGroupDetails: IServerGroup) => {
        let fromApp = this.app.getDataSource('serverGroups').data.find((toCheck: IServerGroup) => {
          return toCheck.name === name && toCheck.account === accountId && toCheck.region === region;
        });

        if (!fromApp) {
          this.app.getDataSource('loadBalancers').data.some((loadBalancer: ILoadBalancer) => {
            if (loadBalancer.account === accountId) {
              return loadBalancer.serverGroups.some((toCheck: IServerGroup) => {
                let result = false;
                if (toCheck.name === name) {
                  fromApp = toCheck;
                  result = true;
                }
                return result;
              });
            } else {
              return false;
            }
          });
        }

        this.serverGroup = { ...serverGroupDetails, ...fromApp };
        this.state.loading = false;
      },
    );
  }

  /*     public enableServerGroup(): void {
      const taskMonitor: ITaskMonitorConfig = {
        application: this.app,
        title: 'Enabling ' + this.serverGroup.name,
      };
  
      const submitMethod = (params: any) =>
        this.serverGroupWriter.enableServerGroup(this.serverGroup, this.app, { ...params });
  
      const modalBody = `<div class="well well-sm">
          <p>
            Enabling <b>${this.serverGroup.name}</b> will set its traffic allocation for
            <b>${this.serverGroup.loadBalancers[0]}</b> to 100%.
          </p>
          <p>
            If you would like more fine-grained control over your server groups' allocations,
            edit <b>${this.serverGroup.loadBalancers[0]}</b> under the <b>Load Balancers</b> tab.
          </p>
        </div>
      `;
  
      const confirmationModalParams = {
        header: 'Really enable ' + this.serverGroup.name + '?',
        buttonText: 'Enable ' + this.serverGroup.name,
        body: modalBody,
        account: this.serverGroup.account,
        taskMonitorConfig: taskMonitor,
        platformHealthOnlyShowOverride: this.app.attributes.platformHealthOnlyShowOverride,
        platformHealthType: CloudrunHealth.PLATFORM,
        submitMethod,
        askForReason: true,
        interestingHealthProviderNames: [] as string[],
      };
  
      if (this.app.attributes.platformHealthOnlyShowOverride && this.app.attributes.platformHealthOnly) {
        confirmationModalParams.interestingHealthProviderNames = [CloudrunHealth.PLATFORM];
      }
  
      ConfirmationModalService.confirm(confirmationModalParams);
    } */
}

export const CLOUDRUN_SERVER_GROUP_DETAILS_CTRL = 'spinnaker.cloudrun.serverGroup.details.controller';

module(CLOUDRUN_SERVER_GROUP_DETAILS_CTRL, [SERVER_GROUP_WRITER]).controller(
  'cloudrunV2ServerGroupDetailsCtrl',
  CloudrunServerGroupDetailsController,
);
