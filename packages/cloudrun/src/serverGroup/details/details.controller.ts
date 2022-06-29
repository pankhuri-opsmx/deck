import type { IController, IScope } from 'angular';
import { module } from 'angular';
import { cloneDeep, mapValues, reduce } from 'lodash';
import type { Application, ILoadBalancer, IServerGroup, ServerGroupWriter } from '@spinnaker/core';
import { ConfirmationModalService, SERVER_GROUP_WRITER, ServerGroupReader } from '@spinnaker/core';
import { CloudrunHealth } from '../../common/cloudrunHealth';
import type { ICloudrunLoadBalancer } from '../../common/domain/ICloudrunLoadBalancer';
import type { ICloudrunServerGroup } from '../../interfaces';

interface IServerGroupFromStateParams {
  accountId: string;
  region: string;
  name: string;
}

class CloudrunServerGroupDetailsController implements IController {
  public state = { loading: true };
  public serverGroup: ICloudrunServerGroup;

  public static $inject = ['$state', '$scope', 'serverGroup', 'app', 'serverGroupWriter'];
  constructor(
    private $state: any,
    private $scope: IScope,
    serverGroup: IServerGroupFromStateParams,
    public app: Application,
    private serverGroupWriter: ServerGroupWriter,
  ) {
    this.extractServerGroup(serverGroup)
      .then(() => {
        if (!this.$scope.$$destroyed) {
          this.app.getDataSource('serverGroups').onRefresh(this.$scope, () => this.extractServerGroup(serverGroup));
        }
      })
      .catch(() => this.autoClose());
  }

  // on disabling a server group , the load balancer will be set to 0 percent and will be added to enabled ones
  private expectedAllocationsAfterDisableOperation(
    serverGroup: IServerGroup,
    app: Application,
  ): { [key: string]: number } {
    const loadBalancer = app.getDataSource('loadBalancers').data.find((toCheck: ICloudrunLoadBalancer): boolean => {
      const allocations = toCheck.split?.trafficTargets ?? [];
      const enabledServerGroups = allocations
        .filter(({ percent }) => percent === 0)
        .map((allocations) => allocations.revisionName);
      return enabledServerGroups.includes(serverGroup.name);
    });

    if (loadBalancer) {
      let allocations = cloneDeep(loadBalancer.split.trafficTargets);
      delete allocations[serverGroup.name];
      const denominator = reduce(allocations, (partialSum: number, allocation: number) => partialSum + allocation, 0);
      allocations = mapValues(allocations, (allocation) => Math.round(allocation / denominator));
      return allocations;
    } else {
      return null;
    }
  }
  // destroy existing server group
  public canDestroyServerGroup(): boolean {
    if (this.serverGroup) {
      const expectedAllocations = this.expectedAllocationsAfterDisableOperation(this.serverGroup, this.app);
      const isCurrentRevision = this.serverGroup.tags.isLatest;
      if (expectedAllocations) {
        return Object.keys(expectedAllocations).length > 0;
      } else if (isCurrentRevision) {
        return false;
      } else if (this.serverGroup.disabled) {
        return true;
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

      interestingHealthProviderNames: [] as string[],
    };

    if (this.app.attributes.platformHealthOnlyShowOverride && this.app.attributes.platformHealthOnly) {
      confirmationModalParams.interestingHealthProviderNames = [CloudrunHealth.PLATFORM];
    }

    ConfirmationModalService.confirm(confirmationModalParams);
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
}
export const CLOUDRUN_SERVER_GROUP_DETAILS_CTRL = 'spinnaker.cloudrun.serverGroup.details.controller';

module(CLOUDRUN_SERVER_GROUP_DETAILS_CTRL, [SERVER_GROUP_WRITER]).controller(
  'cloudrunV2ServerGroupDetailsCtrl',
  CloudrunServerGroupDetailsController,
);
