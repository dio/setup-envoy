import * as core from '@actions/core';

import * as main from '../src/main';

const envoyTestManifest = require('./data/envoy-versions.json');

describe('setup-envoy', () => {
  let inputs = {} as any;
  let os = {} as any;

  let inSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env['GITHUB_PATH'] = '';
    inputs = {};
    inSpy = jest.spyOn(core, 'getInput');
    inSpy.mockImplementation((name: string) => inputs[name]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  afterAll(() => {});

  it('ok', async () => {
    await main.run();
  });
});
