import { readFile, cp, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { globbySync } from 'globby'

function validateArgs(args: string[]) {
  if (typeof args[0] !== 'string') {
    throw new Error('First argument must be a package name')
  }
}

// get arguments
const args = process.argv.slice(2)
validateArgs(args)

const packageName = args[0]
const template = path.resolve(__dirname, '../template/package')
const target = path.resolve(__dirname, '../packages', packageName)

async function createPackage() {
  await cp(template, target, { recursive: true })

  for (const file of globbySync(['**/*'], {
    cwd: target,
    absolute: true,
  })) {
    const content = await readFile(file, 'utf-8')
    const newContent = content.replace(/\{packageName\}/g, packageName)
    await writeFile(file, newContent, 'utf-8')
  }

  console.log(`Package @midwayjs/${packageName} created successfully!`)
}

createPackage()
