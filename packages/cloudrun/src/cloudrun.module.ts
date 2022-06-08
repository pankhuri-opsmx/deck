import { module } from 'angular';

import { CloudProviderRegistry, SETTINGS } from '@spinnaker/core';

import { CLOUDRUN_LOAD_BALANCER_CREATE_MESSAGE } from './common/loadBalancerMessage.component';
import './help/cloudrun.help';
import { CLOUDRUN_ALLOCATION_CONFIGURATION_ROW } from './loadBalancer/configure/wizard/allocationConfigurationRow.component';
import { CLOUDRUN_LOAD_BALANCER_BASIC_SETTINGS } from './loadBalancer/configure/wizard/basicSettings.component';
import { CLOUDRUN_STAGE_ALLOCATION_CONFIGURATION_ROW } from './loadBalancer/configure/wizard/stageAllocationConfigurationRow.component';
import { CLOUDRUN_LOAD_BALANCER_WIZARD_CTRL } from './loadBalancer/configure/wizard/wizard.controller';
import { CLOUDRUN_LOAD_BALANCER_DETAILS_CTRL } from './loadBalancer/details/details.controller';
//import { CLOUDRUN_SERVER_GROUP_MANAGER_DETAILS_CTRL } from './serverGroupManager/details/details.controller';
import { CLOUDRUN_LOAD_BALANCER_TRANSFORMER } from './loadBalancer/loadBalancerTransformer';
import logo from './logo/cloudrun.logo.png';
import { CLOUDRUN_PIPELINE_MODULE } from './pipeline/pipeline.module';
/* import { CLOUDRUN_SERVER_GROUP_RESIZE_CTRL } from './serverGroup/details/resize/resize.controller'; */
/* import { CLOUDRUN_SERVER_GROUP_COMMAND_BUILDER } from './serverGroup/serverGroupCommandBuilder.service'; */
import { CLOUDRUN_SERVER_GROUP_COMMAND_BUILDER } from './serverGroup/configure/serverGroupCommandBuilder.service';
import { ServerGroupWizard } from './serverGroup/configure/wizard/serverGroupWizard';
import { CLOUDRUN_SERVER_GROUP_DETAILS_CTRL } from './serverGroup/details/details.controller';
import { CLOUDRUN_SERVER_GROUP_TRANSFORMER } from './serverGroup/serverGroupTransformer.service';
import { CLOUDRUN_SERVER_GROUP_WRITER } from './serverGroup/writer/serverGroup.write.service';

import './logo/cloudrun.logo.less';

/* import './help/kubernetes.help';
import { KUBERNETES_INSTANCE_DETAILS_CTRL } from './instance/details/details.controller';
import { KUBERNETES_LOAD_BALANCER_DETAILS_CTRL } from './loadBalancer/details/details.controller';
import { KUBERNETES_LOAD_BALANCER_TRANSFORMER } from './loadBalancer/transformer';
import kubernetesLogo from './logo/kubernetes.logo.svg';
import { KUBERNETES_ANNOTATION_CUSTOM_SECTIONS } from './manifest/annotationCustomSections.component';
import { KUBERNETES_MANIFEST_ARTIFACT } from './manifest/artifact/artifact.component';
import { KUBERNETES_MANIFEST_DELETE_CTRL } from './manifest/delete/delete.controller';
import { JSON_EDITOR_COMPONENT } from './manifest/editor/json/jsonEditor.component';
import { KUBERNETES_MANIFEST_EVENTS } from './manifest/manifestEvents.component';
import { KUBERNETES_MANIFEST_IMAGE_DETAILS } from './manifest/manifestImageDetails.component';
import { KUBERNETES_MANIFEST_LABELS } from './manifest/manifestLabels.component';
import { KUBERNETES_MANIFEST_QOS } from './manifest/manifestQos.component';
import { KUBERNETES_MANIFEST_RESOURCES } from './manifest/manifestResources.component';
import { KUBERNETES_ROLLING_RESTART } from './manifest/rollout/RollingRestart';
import { KUBERNETES_MANIFEST_PAUSE_ROLLOUT_CTRL } from './manifest/rollout/pause.controller';
import { KUBERNETES_MANIFEST_RESUME_ROLLOUT_CTRL } from './manifest/rollout/resume.controller';
import { KUBERNETES_MANIFEST_UNDO_ROLLOUT_CTRL } from './manifest/rollout/undo.controller';
import { KUBERNETES_MANIFEST_SCALE_CTRL } from './manifest/scale/scale.controller';
import { KUBERNETES_MANIFEST_SELECTOR } from './manifest/selector/selector.component';
import { KUBERNETES_MANIFEST_CONDITION } from './manifest/status/condition.component';
import { KUBERNETES_MANIFEST_STATUS } from './manifest/status/status.component';

import './pipelines/stages';
import { KUBERNETES_FIND_ARTIFACTS_FROM_RESOURCE_STAGE } from './pipelines/stages/findArtifactsFromResource/findArtifactsFromResourceStage';
import { KUBERNETES_SCALE_MANIFEST_STAGE } from './pipelines/stages/scaleManifest/scaleManifestStage';
import { KUBERNETES_DISABLE_MANIFEST_STAGE } from './pipelines/stages/traffic/disableManifest.stage';
import { KUBERNETES_ENABLE_MANIFEST_STAGE } from './pipelines/stages/traffic/enableManifest.stage';
import { KUBERNETES_UNDO_ROLLOUT_MANIFEST_STAGE } from './pipelines/stages/undoRolloutManifest/undoRolloutManifestStage';
import './pipelines/validation/manifestSelector.validator';
import { KUBERNETS_RAW_RESOURCE_MODULE } from './rawResource';
import { KUBERNETES_RESOURCE_STATES } from './resources/resources.state';
import { KUBERNETES_SECURITY_GROUP_DETAILS_CTRL } from './securityGroup/details/details.controller';
import { KubernetesSecurityGroupReader } from './securityGroup/securityGroup.reader';
import { KUBERNETES_SECURITY_GROUP_TRANSFORMER } from './securityGroup/transformer';

import './validation/applicationName.validator';

import './logo/kubernetes.logo.less'; */

export const CLOUDRUN_MODULE = 'spinnaker.cloudrun';

const requires = [
  CLOUDRUN_SERVER_GROUP_COMMAND_BUILDER,
  CLOUDRUN_SERVER_GROUP_DETAILS_CTRL,
  CLOUDRUN_SERVER_GROUP_TRANSFORMER,
  //CLOUDRUN_SERVER_GROUP_MANAGER_DETAILS_CTRL,
  /*   KUBERNETES_SERVER_GROUP_RESIZE_CTRL, */
  //CLOUDRUN_SERVER_GROUP_MANAGER_DETAILS_CTRL,
  CLOUDRUN_SERVER_GROUP_WRITER,
  CLOUDRUN_LOAD_BALANCER_TRANSFORMER,
  CLOUDRUN_LOAD_BALANCER_DETAILS_CTRL,
  CLOUDRUN_LOAD_BALANCER_WIZARD_CTRL,
  CLOUDRUN_LOAD_BALANCER_CREATE_MESSAGE,
  CLOUDRUN_ALLOCATION_CONFIGURATION_ROW,
  CLOUDRUN_LOAD_BALANCER_BASIC_SETTINGS,
  CLOUDRUN_STAGE_ALLOCATION_CONFIGURATION_ROW,
  CLOUDRUN_PIPELINE_MODULE,
  /* KUBERNETES_INSTANCE_DETAILS_CTRL,
  KUBERNETES_LOAD_BALANCER_DETAILS_CTRL,
  KUBERNETES_SECURITY_GROUP_DETAILS_CTRL,
 
  KUBERNETES_MANIFEST_DELETE_CTRL,
  KUBERNETES_MANIFEST_SCALE_CTRL,
  KUBERNETES_MANIFEST_UNDO_ROLLOUT_CTRL,
  KUBERNETES_MANIFEST_PAUSE_ROLLOUT_CTRL,
  KUBERNETES_MANIFEST_RESUME_ROLLOUT_CTRL,
  KUBERNETES_MANIFEST_STATUS,
  KUBERNETES_MANIFEST_CONDITION,
  KUBERNETES_MANIFEST_ARTIFACT,
  KUBERNETES_LOAD_BALANCER_TRANSFORMER,
  KUBERNETES_SECURITY_GROUP_TRANSFORMER,
  KUBERNETES_SCALE_MANIFEST_STAGE,
  KUBERNETES_UNDO_ROLLOUT_MANIFEST_STAGE,
  KUBERNETES_FIND_ARTIFACTS_FROM_RESOURCE_STAGE,
  KUBERNETES_MANIFEST_SELECTOR,
  KUBERNETES_MANIFEST_LABELS,
  KUBERNETES_MANIFEST_EVENTS,
  KUBERNETES_MANIFEST_RESOURCES,
  KUBERNETES_MANIFEST_QOS,
  KUBERNETES_ANNOTATION_CUSTOM_SECTIONS,
  KUBERNETES_MANIFEST_IMAGE_DETAILS,
  KUBERNETES_RESOURCE_STATES,
  YAML_EDITOR_COMPONENT,
  JSON_EDITOR_COMPONENT,
  KUBERNETES_ENABLE_MANIFEST_STAGE,
  KUBERNETES_DISABLE_MANIFEST_STAGE,
  STAGE_ARTIFACT_SELECTOR_COMPONENT_REACT,
  KUBERNETES_ROLLING_RESTART, */
];

/* if (SETTINGS.feature.kubernetesRawResources) {
  requires.push(KUBERNETS_RAW_RESOURCE_MODULE);
} */

module(CLOUDRUN_MODULE, requires).config(() => {
  CloudProviderRegistry.registerProvider('cloudrun', {
    name: 'cloudrun',
    adHocInfrastructureWritesEnabled: SETTINGS.cloudrunAdHocInfraWritesEnabled,
    logo: {
      path: logo,
    },
    serverGroup: {
      CloneServerGroupModal: ServerGroupWizard,
      commandBuilder: 'cloudrunV2ServerGroupCommandBuilder',
      detailsController: 'cloudrunV2ServerGroupDetailsCtrl',
      detailsTemplateUrl: require('./serverGroup/details/details.html'),
      transformer: 'cloudrunV2ServerGroupTransformer',
    },
    /*  serverGroupManager: {
      detailsTemplateUrl: require('./serverGroupManager/details/details.html'),
      detailsController: 'cloudrunV2ServerGroupManagerDetailsCtrl',
    }, */

    loadBalancer: {
      transformer: 'cloudrunLoadBalancerTransformer',
      createLoadBalancerTemplateUrl: require('./loadBalancer/configure/wizard/wizard.html'),
      createLoadBalancerController: 'cloudrunLoadBalancerWizardCtrl',
      detailsTemplateUrl: require('./loadBalancer/details/details.html'),
      detailsController: 'cloudrunLoadBalancerDetailsCtrl',
    },
  });
});
