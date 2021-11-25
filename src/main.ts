import * as core from '@actions/core';
import * as installer from '../src/installer';

export async function run() {
  try {
    let version = core.getInput('envoy-version');
    await installer.getEnvoy(version);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}
