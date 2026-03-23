import { resolve } from 'path';
import { homedir } from 'os';

export interface PathValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validates that a path is within the allowed working directory or the
 * user's home directory.
 *
 * NOTE: The home-directory fallback is intentionally broad. The daemon's
 * workingDirectory is its startup cwd, but sessions (and their worktrees)
 * can live anywhere under $HOME. A proper fix would track each session's
 * directory and validate against that set, but this simple approach is
 * sufficient for single-user machines where happy-coder is typically run.
 *
 * @param targetPath - The path to validate (can be relative or absolute)
 * @param workingDirectory - The primary working directory (must be absolute)
 * @returns Validation result
 */
export function validatePath(targetPath: string, workingDirectory: string): PathValidationResult {
    const resolvedTarget = resolve(workingDirectory, targetPath);
    const resolvedWorkingDir = resolve(workingDirectory);

    // Check primary working directory
    if (resolvedTarget.startsWith(resolvedWorkingDir + '/') || resolvedTarget === resolvedWorkingDir) {
        return { valid: true };
    }

    // Allow any path under $HOME — sessions and worktrees can be anywhere
    // under the user's home directory.
    const home = homedir();
    if (home && (resolvedTarget.startsWith(home + '/') || resolvedTarget === home)) {
        return { valid: true };
    }

    return {
        valid: false,
        error: `Access denied: Path '${targetPath}' is outside the working directory`
    };
}
