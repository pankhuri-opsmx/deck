import { module } from 'angular';
import type { Application } from '@spinnaker/core';
import type { ICloudrunServerGroup, ICloudrunServerGroupManager } from '../interfaces';

import type { ICloudrunServerGroupCommandData } from '../serverGroup/configure/serverGroupCommandBuilder.service';

export class CloudrunV2ServerGroupTransformer {
  public normalizeServerGroup(
    serverGroup: ICloudrunServerGroup,
    application: Application,
  ): PromiseLike<ICloudrunServerGroup> {
    return application
      .getDataSource('serverGroupManagers')
      .ready()
      .then((sgManagers: ICloudrunServerGroupManager[]) => {
        (serverGroup.serverGroupManagers || []).forEach((managerRef) => {
          const sgManager = sgManagers.find(
            (manager: ICloudrunServerGroupManager) =>
              managerRef.account == manager.account &&
              managerRef.location == manager.region &&
              `${manager.kind} ${managerRef.name}` == manager.name,
          );
          if (sgManager) {
            managerRef.name = sgManager.name;
          }
        });
        return serverGroup;
      });
  }

  public convertServerGroupCommandToDeployConfiguration(base: ICloudrunServerGroupCommandData): any {
    const deployConfig = { ...base } as any;
    // eslint-disable-next-line no-debugger
    debugger;
    deployConfig.cloudProvider = 'cloudrun';
    //deployConfig.availabilityZones = { [deployConfig.region]: base.availabilityZones };
    // deployConfig.loadBalancers = (base.loadBalancers || []).concat(base.vpcLoadBalancers || []);
    // deployConfig.targetGroups = base.targetGroups || [];
    deployConfig.account = deployConfig.credentials;
    // deployConfig.subnetType = deployConfig.subnetType || '';

    const deleteFields = [
      'regions',
      'viewState',
      'backingData',
      'selectedProvider',
      'instanceProfile',
      'vpcId',
      'relationships',
      'manifest',
      'manifests',
      'moniker',
      'stack',
      'versioned',
      'availabilityZones',
      'source',
    ];
    deleteFields.forEach((key: keyof typeof deployConfig) => {
      delete deployConfig[key];
    });

    return deployConfig;
  }
}

export const CLOUDRUN_SERVER_GROUP_TRANSFORMER = 'spinnaker.cloudrun.serverGroup.transformer.service';
module(CLOUDRUN_SERVER_GROUP_TRANSFORMER, []).service(
  'cloudrunV2ServerGroupTransformer',
  CloudrunV2ServerGroupTransformer,
);
