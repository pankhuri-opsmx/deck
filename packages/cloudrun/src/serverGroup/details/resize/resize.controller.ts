import type { IController } from 'angular';
import { copy, equals, module } from 'angular';
import type { IModalServiceInstance } from 'angular-ui-bootstrap';

import type { Application, ICapacity, ServerGroupWriter } from '@spinnaker/core';
import { SERVER_GROUP_WRITER, TaskMonitor } from '@spinnaker/core';
import type { ICloudrunServerGroup } from '../../../interfaces';

interface IResizeCommand {
  capacity: ICapacity;
  reason: string;
}

class CloudrunServerGroupResizeController implements IController {
  public taskMonitor: TaskMonitor;
  public command: IResizeCommand;
  public current: ICapacity;
  public verification = {
    verified: false,
  };

  public static $inject = ['serverGroup', '$uibModalInstance', 'serverGroupWriter', 'application'];
  constructor(
    public serverGroup: ICloudrunServerGroup,
    private $uibModalInstance: IModalServiceInstance,
    private serverGroupWriter: ServerGroupWriter,
    private application: Application,
  ) {
    this.taskMonitor = new TaskMonitor({
      title: `Resizing ${this.serverGroup.name}`,
      application,
      modalInstance: $uibModalInstance,
    });

    this.current = this.serverGroup.capacity;
    this.command = {
      capacity: copy(this.current),
      reason: null,
    };
  }

  public isValid(): boolean {
    return (
      this.verification.verified && this.command.capacity.desired >= 0 && !equals(this.command.capacity, this.current)
    );
  }

  public cancel(): void {
    this.$uibModalInstance.dismiss();
  }

  public resize(): void {
    this.taskMonitor.submit(() => {
      const payload = {
        capacity: this.command.capacity,
        serverGroupName: this.serverGroup.name,
        account: this.serverGroup.account,
        region: this.serverGroup.region,
        interestingHealthProviderNames: ['KubernetesPod'],
        reason: this.command.reason,
      };

      return this.serverGroupWriter.resizeServerGroup(this.serverGroup, this.application, payload);
    });
  }
}

export const CLOUDRUN_SERVER_GROUP_RESIZE_CTRL = 'spinnaker.cloudrun.serverGroup.details.resize.controller';

module(CLOUDRUN_SERVER_GROUP_RESIZE_CTRL, [SERVER_GROUP_WRITER]).controller(
  'cloudrunV2ServerGroupResizeCtrl',
  CloudrunServerGroupResizeController,
);
