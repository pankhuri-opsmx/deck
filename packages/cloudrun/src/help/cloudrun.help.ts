import { HelpContentsRegistry } from '@spinnaker/core';

const helpContents = [
  {
    key: 'cloudrun.serverGroup.stack',
    value:
      '(Optional) <b>Stack</b> is one of the core naming components of a cluster, used to create vertical stacks of dependent services for integration testing.',
  },
  {
    key: 'cloudrun.serverGroup.configFiles',
    value: `<p> The contents of a Cloudrun config file (e.g., an <code>app.yaml</code> </p>`,
  },
  {
    key: 'cloudrun.loadBalancer.allocations',
    value: 'An allocation is the percent of traffic directed to a server group.',
  },
];

helpContents.forEach((entry) => HelpContentsRegistry.register(entry.key, entry.value));
