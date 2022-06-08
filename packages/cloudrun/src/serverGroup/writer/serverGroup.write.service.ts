/* eslint-disable no-debugger */
import { module } from 'angular';

import type { Application, IJob, IServerGroup, ITask, ITaskCommand } from '@spinnaker/core';
import { TaskExecutor } from '@spinnaker/core';

interface ICloudrunServerGroupWriteJob extends IJob {
  serverGroupName: string;
  region: string;
  credentials: string;
  cloudProvider: string;
}

export class CloudrunServerGroupWriter {
  public createServerGroup(serverGroup: IServerGroup, application: Application): PromiseLike<ITask> {
    debugger;
    const job = this.buildJob(serverGroup, application, 'createServerGroup');

    const command: ITaskCommand = {
      job: [job],
      application,
      description: ` Create Server Group: ${serverGroup.name}`,
    };

    return TaskExecutor.executeTask(command);
  }

  /*     public createServerGroup(serverGroup: IServerGroup, application: Application): PromiseLike<ITask> {
        const job = this.buildJob(serverGroup, application, 'startAppEngineServerGroup');
    
        const command: ITaskCommand = {
          job: [job],
          application,
          description: `Start Server Group: ${serverGroup.name}`,
        };
    
        return TaskExecutor.executeTask(command);
}

  public stopServerGroup(serverGroup: IServerGroup, application: Application): PromiseLike<ITask> {
    const job = this.buildJob(serverGroup, application, 'stopAppEngineServerGroup');

    const command: ITaskCommand = {
      job: [job],
      application,
      description: `Stop Server Group: ${serverGroup.name}`,
    };

    return TaskExecutor.executeTask(command);
  }
 */
  private buildJob(serverGroup: IServerGroup, application: Application, type: string): ICloudrunServerGroupWriteJob {
    return {
      type,
      region: serverGroup.region,
      serverGroupName: serverGroup.name,
      credentials: serverGroup.account,
      cloudProvider: 'cloudrun',
      application: application.name,
    };
  }
}

export const CLOUDRUN_SERVER_GROUP_WRITER = 'spinnaker.cloudrun.serverGroup.write.service';

module(CLOUDRUN_SERVER_GROUP_WRITER, []).service('cloudrunServerGroupWriter', CloudrunServerGroupWriter);
