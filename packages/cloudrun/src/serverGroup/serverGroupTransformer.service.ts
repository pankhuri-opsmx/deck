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

    deployConfig.cloudProvider = 'cloudrun';
    deployConfig.account = deployConfig.credentials;

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
