#!/usr/bin/env bash
# Sourced by CI deploy steps. Builds the ssh command array `ssh_cmd` and the target `ssh_target`.
# Env: SSH_HOST, SSH_USER (default root), SSHPASS (password auth) or ~/.ssh/deploy_key (key auth),
#      ~/.ssh/known_hosts (strict host key checking when present).

ssh_opts=(-o ConnectTimeout=15 -o ServerAliveInterval=30)
if [ -s ~/.ssh/known_hosts ]; then
    ssh_opts+=(-o StrictHostKeyChecking=yes)
else
    ssh_opts+=(-o StrictHostKeyChecking=accept-new)
fi

# Prefer an SSH key when provided, otherwise fall back to password auth
if [ -f ~/.ssh/deploy_key ]; then
    ssh_cmd=(ssh -i ~/.ssh/deploy_key -o IdentitiesOnly=yes "${ssh_opts[@]}")
else
    ssh_cmd=(sshpass -e ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no "${ssh_opts[@]}")
fi

ssh_target="${SSH_USER:-root}@${SSH_HOST}"
