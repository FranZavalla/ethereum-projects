// Copies the compiled Escrow ABI and bytecode into the app source tree, so the
// frontend always talks to the same interface as `contracts/Escrow.sol`.
//
// Runs automatically before `dev` and `build`. If the artifact is missing
// (e.g. a fresh clone that has not compiled yet) the committed copy in
// `src/contracts/Escrow.json` is left untouched and a warning is printed.

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const artifactPath = resolve(appDir, '../artifacts/contracts/Escrow.sol/Escrow.json')
const outputPath = resolve(appDir, 'src/contracts/Escrow.json')

try {
  const artifact = JSON.parse(await readFile(artifactPath, 'utf8'))
  const trimmed = {
    contractName: artifact.contractName,
    abi: artifact.abi,
    bytecode: artifact.bytecode,
  }

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(trimmed, null, 2)}\n`)
  console.log(`sync-abi: wrote ${trimmed.contractName} ABI to src/contracts/Escrow.json`)
} catch (error) {
  console.warn(`sync-abi: could not read ${artifactPath}`)
  console.warn(`sync-abi: ${error instanceof Error ? error.message : error}`)
  console.warn('sync-abi: keeping the existing src/contracts/Escrow.json')
}
