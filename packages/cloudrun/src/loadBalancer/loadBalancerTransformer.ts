import { module } from 'angular';
import { camelCase, chain, cloneDeep, filter, get, has, reduce } from 'lodash';

import type {
  Application,
  IInstance,
  IInstanceCounts,
  ILoadBalancer,
  ILoadBalancerUpsertCommand,
  IServerGroup,
} from '@spinnaker/core';
import type { ICloudrunLoadBalancer, ICloudrunTrafficSplit, ShardBy } from '../common/domain/index';

export interface ICloudrunAllocationDescription {
  serverGroupName?: string;
  target?: string;
  cluster?: string;
  allocation: number;
  locatorType: 'fromExisting' | 'targetCoordinate' | 'text';
}

export interface ICloudrunTrafficSplitDescription {
  shardBy: ShardBy;
  allocationDescriptions: ICloudrunAllocationDescription[];
}

export class CloudrunLoadBalancerUpsertDescription implements ILoadBalancerUpsertCommand, ICloudrunLoadBalancer {
  public credentials: string;
  public account: string;
  public loadBalancerName: string;
  public name: string;
  public splitDescription: ICloudrunTrafficSplitDescription;
  public split?: ICloudrunTrafficSplit;
  public migrateTraffic: boolean;
  public region: string;
  public cloudProvider: string;
  public serverGroups?: any[];

  public static convertTrafficSplitToTrafficSplitDescription(
    split: ICloudrunTrafficSplit,
  ): ICloudrunTrafficSplitDescription {
    // eslint-disable-next-line no-debugger
    debugger;
    const allocationDescriptions = reduce(
      split.allocations,
      (acc: ICloudrunAllocationDescription[], allocation: number, serverGroupName: string) => {
        return acc.concat({ serverGroupName, allocation, locatorType: 'fromExisting' });
      },
      [],
    );
    // eslint-disable-next-line no-console
    console.log('allD', allocationDescriptions);
    return { shardBy: split.shardBy, allocationDescriptions };
  }

  constructor(loadBalancer: ICloudrunLoadBalancer) {
    this.credentials = loadBalancer.account || loadBalancer.credentials;
    this.account = this.credentials;
    this.cloudProvider = loadBalancer.cloudProvider;
    this.loadBalancerName = loadBalancer.name;
    this.name = loadBalancer.name;
    this.region = loadBalancer.region;
    this.migrateTraffic = loadBalancer.migrateTraffic || false;
    this.serverGroups = loadBalancer.serverGroups;
  }

  public mapAllocationsToDecimals() {
    this.splitDescription.allocationDescriptions.forEach((description) => {
      description.allocation = description.allocation / 100;
    });
  }

  public mapAllocationsToPercentages() {
    this.splitDescription.allocationDescriptions.forEach((description) => {
      // An allocation percent has at most one decimal place.
      description.allocation = Math.round(description.allocation * 1000) / 10;
    });
  }
}

export class CloudrunLoadBalancerTransformer {
  public static $inject = ['$q'];
  constructor(private $q: ng.IQService) {}
  public normalizeLoadBalancer(loadBalancer: ILoadBalancer): PromiseLike<ILoadBalancer> {
    // eslint-disable-next-line no-debugger
    debugger;
    loadBalancer.provider = loadBalancer.type;
    loadBalancer.instanceCounts = this.buildInstanceCounts(loadBalancer.serverGroups);
    loadBalancer.instances = [];
    loadBalancer.serverGroups.forEach((serverGroup) => {
      serverGroup.account = loadBalancer.account;
      serverGroup.region = loadBalancer.region;

      if (serverGroup.detachedInstances) {
        serverGroup.detachedInstances = (serverGroup.detachedInstances as any).map((id: string) => ({ id }));
      }
      serverGroup.instances = serverGroup.instances
        .concat(serverGroup.detachedInstances || [])
        .map((instance: any) => this.transformInstance(instance, loadBalancer));
    });

    const activeServerGroups = filter(loadBalancer.serverGroups, { isDisabled: false });
    loadBalancer.instances = chain(activeServerGroups).map('instances').flatten().value() as IInstance[];
    return this.$q.resolve(loadBalancer);
  }

  public convertLoadBalancerForEditing(
    loadBalancer: ICloudrunLoadBalancer,
    application: Application,
  ): PromiseLike<ICloudrunLoadBalancer> {
    return application
      .getDataSource('loadBalancers')
      .ready()
      .then(() => {
        const upToDateLoadBalancer = application
          .getDataSource('loadBalancers')
          .data.find((candidate: ILoadBalancer) => {
            return (
              candidate.name === loadBalancer.name &&
              (candidate.account === loadBalancer.account || candidate.account === loadBalancer.credentials)
            );
          });

        if (upToDateLoadBalancer) {
          loadBalancer.serverGroups = cloneDeep(upToDateLoadBalancer.serverGroups);
        }
        return loadBalancer;
      });
  }

  public convertLoadBalancerToUpsertDescription(
    loadBalancer: ICloudrunLoadBalancer,
  ): CloudrunLoadBalancerUpsertDescription {
    return new CloudrunLoadBalancerUpsertDescription(loadBalancer);
  }

  private buildInstanceCounts(serverGroups: IServerGroup[]): IInstanceCounts {
    const instanceCounts: IInstanceCounts = chain(serverGroups)
      .map('instances')
      .flatten()
      .reduce(
        (acc: IInstanceCounts, instance: any) => {
          if (has(instance, 'health.state')) {
            acc[camelCase(instance.health.state)]++;
          }
          return acc;
        },
        { up: 0, down: 0, outOfService: 0, succeeded: 0, failed: 0, starting: 0, unknown: 0 },
      )
      .value();

    instanceCounts.outOfService += chain(serverGroups).map('detachedInstances').flatten().value().length;
    return instanceCounts;
  }

  private transformInstance(instance: any, loadBalancer: ILoadBalancer) {
    instance.provider = loadBalancer.type;
    instance.account = loadBalancer.account;
    instance.region = loadBalancer.region;
    instance.loadBalancers = [loadBalancer.name];
    const health = instance.health || {};
    instance.healthState = get(instance, 'health.state') || 'OutOfService';
    instance.health = [health];

    return instance as IInstance;
  }
}

export const CLOUDRUN_LOAD_BALANCER_TRANSFORMER = 'spinnaker.cloudrun.loadBalancer.transformer.service';

module(CLOUDRUN_LOAD_BALANCER_TRANSFORMER, []).service(
  'cloudrunLoadBalancerTransformer',
  CloudrunLoadBalancerTransformer,
);
