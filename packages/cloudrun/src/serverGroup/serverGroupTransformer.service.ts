import { module } from 'angular';
import type { Application } from '@spinnaker/core';
import type { ICloudrunServerGroup, ICloudrunServerGroupManager } from '../interfaces';

import type { ICloudrunServerGroupCommand } from '../serverGroup/configure/serverGroupCommandBuilder.service';

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

  public convertServerGroupCommandToDeployConfiguration(command: ICloudrunServerGroupCommand): any {
    return new CloudrunDeployDescription(command);
  }
}

export class CloudrunDeployDescription {
  public cloudProvider = 'cloudrun';
  public provider = 'cloudrun';
  public credentials: string;
  public account: string;
  public application: string;
  public stack?: string;
  public freeFormDetails?: string;
  public configFiles: string[];
  public region: string;
  public strategy?: string;
  public type?: string;
  public fromArtifact: boolean;
  public configArtifacts: string[];
  public strategyApplication?: string;
  public strategyPipeline?: string;
  public gitCredentialType: string;
  public interestingHealthProviderNames: string[];
  public sourceType: string;

  constructor(command: ICloudrunServerGroupCommand) {
    this.credentials = command.credentials;
    this.account = command.credentials;
    this.application = command.application;
    this.stack = command.stack;
    this.freeFormDetails = command.freeFormDetails;
    this.region = command.region;
    this.strategy = command.strategy;
    this.type = command.type;
    this.fromArtifact = command.fromArtifact;
    this.gitCredentialType = command.gitCredentialType;
    this.configFiles = command.configFiles;
    this.sourceType = command.sourceType;
    this.interestingHealthProviderNames = command.interestingHealthProviderNames || [];
    this.configArtifacts = [];
  }
}

export const CLOUDRUN_SERVER_GROUP_TRANSFORMER = 'spinnaker.cloudrun.serverGroup.transformer.service';
module(CLOUDRUN_SERVER_GROUP_TRANSFORMER, []).service(
  'cloudrunV2ServerGroupTransformer',
  CloudrunV2ServerGroupTransformer,
);
