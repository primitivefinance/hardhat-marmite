export default async function runScript(
  scriptPath: string,
): Promise<void> {
  const { fork } = await import('child_process');

  return new Promise((resolve, reject) => {
    const childProcess = fork(scriptPath, {
      stdio: 'inherit',
      execArgv: ['--require', 'ts-node/register'],
    });

    childProcess.once('close', () => {
      resolve();
    });

    childProcess.once('error', reject);
  });
}
