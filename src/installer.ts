import os = require('os');
import path = require('path');

import * as core from '@actions/core';
import * as hc from '@actions/http-client';
import * as tc from '@actions/tool-cache';
import * as proc from '@actions/exec';

export interface IEnvoyVersions {
  latestVersion: string;
  versions: IEnvoyVersion;
}

export interface IEnvoyVersion {
  [key: string]: IEnvoyVersionRelease;
}

export interface IEnvoyVersionRelease {
  [key: string]: {
    releaseDate: string;
    tarballs: IEnvoyVersionTarball;
  };
}

export interface IEnvoyVersionTarball {
  [key: string]: {
    [key: string]: string;
  };
}

const archMap = {
  x64: 'amd64',
  arm64: 'arm64'
};

export async function getEnvoy(version: string): Promise<void> {
  const envoyVersions = await getEnvoyVersions();
  const currentVersion = version || envoyVersions?.latestVersion!;
  const currentVersionInfo = envoyVersions?.versions[currentVersion];
  const osArch = getOsArch();
  const tarball = currentVersionInfo?.tarballs[osArch];
  const downloaded = await tc.downloadTool(tarball);
  const extracted = await tc.extractTar(downloaded, undefined, ['xJ']);
  core.info(extracted);
  await proc.exec('ls', ['-la', extracted]);
  const cached = await tc.cacheDir(extracted, 'envoy', currentVersion, osArch);
  core.addPath(path.join(cached, 'bin'));
  core.info(path.join(cached, 'bin'));
  await proc.exec('ls', ['-la', path.join(cached)]);
  await proc.exec('ls', ['-la', path.join(cached, 'bin')]);
  await proc.exec(path.join(cached, 'bin', 'envoy'), ['--version']);
  await proc.exec('envoy', ['--version']);
}

const manifestUrl = 'https://archive.tetratelabs.io/envoy/envoy-versions.json';
export async function getEnvoyVersions() {
  const httpClient = new hc.HttpClient('setup-envoy', [], {
    allowRetries: true,
    maxRetries: 3
  });
  const response = await httpClient.getJson<IEnvoyVersions>(manifestUrl);
  return response.result;
}

function getOsArch(): string {
  return os.platform() + '/' + (archMap[os.arch()] || 'amd64');
}
