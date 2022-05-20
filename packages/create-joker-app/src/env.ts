import { execaSync } from 'execa'

let _hasYarn: boolean | null = null

export function hasYarn() {
  if (_hasYarn != null) {
    return _hasYarn
  }

  try {
    execaSync('yarn', ['version'])
    return (_hasYarn = true)
  } catch (e) {
    return (_hasYarn = false)
  }
}

let _hasPnpm: boolean | null = null

export function hasPnpm() {
  if (_hasPnpm != null) {
    return _hasPnpm
  }

  try {
    execaSync('pnpm', ['version'])
    return (_hasPnpm = true)
  } catch (e) {
    return (_hasPnpm = false)
  }
}

let _hasGit: boolean | null = null

export function hasGit() {
  if (_hasGit != null) {
    return _hasGit
  }

  try {
    execaSync('git', ['--version'])
    return (_hasGit = true)
  } catch (e) {
    return (_hasGit = false)
  }
}
