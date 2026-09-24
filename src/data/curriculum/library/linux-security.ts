import { defineTrack } from '../define'

export const linuxSecurity = defineTrack({
  id: 'track-linux-security',
  title: 'Linux and Operating System Security',
  description: 'Securing the operating system layer: Linux users, permissions and capabilities, CIS hardening baselines and patching, SSH and sudo, SELinux and AppArmor, auditd and log pipelines, file integrity monitoring, nftables firewalls, systemd sandboxing, rootkit detection, container and kernel security, Windows essentials for contrast, and Linux forensics basics.',
  family: 'Cybersecurity',
  kind: 'domain',
  icon: '🐧',
  tags: ['linux', 'hardening', 'cis benchmark', 'selinux', 'apparmor', 'auditd', 'nftables', 'systemd', 'ssh', 'forensics', 'windows security'],
  languages: ['Bash', 'YAML'],
  explainMode: 'security',
  code: { label: 'the language or tool that fits (bash, python, yaml)', id: 'bash', fixed: true },
  supports: { labs: true, project: true },
  prerequisites: [],
  style: 'practice',
  categories: [
    {
      title: 'The Linux Security Model',
      description: 'Who can do what on a Linux box, and the mechanisms the kernel uses to decide.',
      topics: [
        {
          title: 'Users, groups and the root account',
          description: 'How UIDs and GIDs identify subjects, what /etc/passwd, /etc/shadow and /etc/group store, why UID 0 bypasses discretionary checks, and how system accounts with nologin shells reduce what a compromised service can do.',
          concepts: ['UIDs, GIDs and name resolution', 'passwd, shadow and group files', 'Root as UID 0', 'System accounts and nologin shells', 'Real, effective and saved IDs'],
          quiz: [
            ['Why are password hashes in /etc/shadow rather than /etc/passwd?', '/etc/passwd must be world-readable for name lookups; /etc/shadow is readable only by root.'],
            ['What does a shell of /usr/sbin/nologin achieve?', 'The account cannot start an interactive login even if its password is known.'],
            ['What is the effective UID used for?', 'Permission checks; it can differ from the real UID under setuid.'],
          ],
        },
        {
          title: 'File permissions, ownership and umask',
          description: 'Reading rwx bits for owner, group and other, how chmod, chown and chgrp change them, why directory execute means traverse, and how umask decides the default mode of every new file a process creates.',
          concepts: ['Owner, group and other bits', 'Octal and symbolic chmod', 'Directory read versus execute', 'umask and default modes', 'Finding world-writable files'],
          quiz: [
            ['What does mode 750 on a directory allow the group?', 'Read and traverse, but not create or delete entries.'],
            ['With umask 027, what mode does a new file get?', '640 (666 minus 027, execute bits never added for files).'],
            ['Which command lists world-writable files under /etc?', 'find /etc -type f -perm -o+w'],
          ],
          prereqs: ['Users, groups and the root account'],
        },
        {
          title: 'setuid, setgid and the sticky bit',
          description: 'The three special bits: setuid binaries run as their owner (passwd needs it, most things should not have it), setgid on directories inherits the group, and the sticky bit on /tmp stops users deleting each other\'s files; why auditing setuid binaries is a hardening staple.',
          concepts: ['setuid binaries and privilege escalation', 'setgid on files and directories', 'Sticky bit on shared directories', 'Finding and pruning setuid files', 'nosuid mount option'],
          quiz: [
            ['Why is a setuid-root copy of bash catastrophic?', 'Any user who runs it gets a root shell.'],
            ['What does the sticky bit on /tmp do?', 'Only the owner (or root) can delete or rename a file inside it.'],
            ['Command to list setuid files system-wide?', 'find / -perm -4000 -type f 2>/dev/null'],
          ],
          prereqs: ['File permissions, ownership and umask'],
        },
        {
          title: 'Linux capabilities',
          description: 'Splitting root into around forty capabilities (CAP_NET_BIND_SERVICE, CAP_SYS_ADMIN, CAP_DAC_OVERRIDE) so a binary or service can bind port 80 without full root; setcap, getcap and the capability sets on processes and files.',
          concepts: ['Capabilities versus all-or-nothing root', 'File capabilities with setcap', 'Permitted, effective and inheritable sets', 'CAP_SYS_ADMIN as the new root', 'Capability bounding in services'],
          quiz: [
            ['Which capability lets a non-root process bind port 443?', 'CAP_NET_BIND_SERVICE.'],
            ['How do you give /usr/bin/ping that capability only?', 'setcap cap_net_raw+ep /usr/bin/ping (ping needs raw sockets).'],
            ['Why is CAP_SYS_ADMIN considered dangerous?', 'It gates so many operations that it is close to full root.'],
          ],
          prereqs: ['setuid, setgid and the sticky bit'],
        },
        {
          title: 'Access control lists and extended attributes',
          description: 'POSIX ACLs (setfacl, getfacl) for per-user grants beyond one owner and one group, default ACLs on directories, the immutable and append-only attributes set with chattr, and how each shows up (or hides) in ls output.',
          concepts: ['setfacl and getfacl', 'Default ACLs on directories', 'Mask entry in ACLs', 'chattr immutable and append-only', 'Spotting ACLs in ls output'],
          quiz: [
            ['What does the + after a mode in ls -l mean?', 'The file has an ACL beyond the standard bits.'],
            ['What does chattr +a on a log file achieve?', 'The file can only be appended to, not truncated or rewritten, even by root until the flag is cleared.'],
          ],
          prereqs: ['File permissions, ownership and umask'],
        },
      ],
    },
    {
      title: 'Hardening Baselines and Patching',
      description: 'Turning a default install into a defensible one, and keeping it that way.',
      topics: [
        {
          title: 'CIS benchmarks and hardening baselines',
          description: 'What a CIS benchmark contains (levels 1 and 2, scored and unscored recommendations), how to read a control with its audit and remediation commands, and how to apply and check a baseline with tools such as OpenSCAP, Lynis or Ansible roles rather than by hand.',
          concepts: ['Benchmark structure and levels', 'Audit and remediation commands', 'OpenSCAP and Lynis scanning', 'Automating baselines with Ansible', 'Documenting exceptions'],
          quiz: [
            ['What is the difference between CIS Level 1 and Level 2?', 'Level 1 is baseline hardening with low impact; Level 2 is defence in depth that may break functionality.'],
            ['Why automate a baseline instead of following the PDF?', 'Repeatability, drift detection and hundreds of controls per host.'],
          ],
        },
        {
          title: 'Patch management on Linux',
          description: 'How apt, dnf and zypper resolve and verify signed packages, unattended-upgrades and dnf-automatic for security-only updates, reboot requirements and live patching, and how to measure patch latency against exploited-in-the-wild advisories.',
          concepts: ['Package signing and repository trust', 'Security-only automatic updates', 'Kernel updates and reboot tracking', 'Live patching options', 'Measuring time to patch'],
          quiz: [
            ['How do you check if a Debian host needs a reboot?', 'The file /var/run/reboot-required exists after a kernel or libc update.'],
            ['What does apt verify before installing a package?', 'The repository Release file signature and package hashes against it.'],
          ],
          prereqs: ['CIS benchmarks and hardening baselines'],
        },
        {
          title: 'Minimal installs and attack surface reduction',
          description: 'Removing what an attacker could use: unneeded packages, compilers and network services, disabling unused filesystems and protocols (cramfs, usb-storage, dccp), and reviewing listening sockets with ss so every open port has an owner and a reason.',
          concepts: ['Minimal base images', 'Removing unneeded services', 'Blacklisting kernel modules', 'Inventory of listening ports', 'Justifying every open port'],
          quiz: [
            ['Command to list listening TCP and UDP sockets with owning process?', 'ss -tulpn'],
            ['How do you stop the usb-storage module loading?', 'Add install usb-storage /bin/false to a modprobe.d config file.'],
          ],
          prereqs: ['CIS benchmarks and hardening baselines'],
        },
        {
          title: 'Boot, kernel parameters and sysctl',
          description: 'Protecting the boot path with a GRUB password and Secure Boot, and tuning kernel behaviour via sysctl: disabling IP forwarding and ICMP redirects, enabling reverse-path filtering, restricting dmesg and kernel pointer exposure, and ptrace scope.',
          concepts: ['GRUB password and single-user mode', 'sysctl network hardening keys', 'kptr_restrict and dmesg_restrict', 'ptrace scope with Yama', 'Persisting sysctl settings'],
          quiz: [
            ['Why set net.ipv4.conf.all.rp_filter=1?', 'Reverse-path filtering drops packets whose source address is not routable via the incoming interface (anti-spoofing).'],
            ['What does kernel.yama.ptrace_scope=1 prevent?', 'Processes attaching to non-descendant processes, which limits credential dumping from memory.'],
          ],
          prereqs: ['Minimal installs and attack surface reduction'],
        },
      ],
    },
    {
      title: 'Remote Access and Privilege',
      description: 'The front door (SSH) and the elevation path (sudo, PAM) are where most Linux intrusions begin.',
      topics: [
        {
          title: 'SSH server hardening',
          description: 'The sshd_config settings that matter: disabling password and root login, restricting users and groups, limiting auth attempts, choosing modern key exchange and ciphers, moving off port 22 only as noise reduction, and validating with sshd -T before restarting.',
          concepts: ['PasswordAuthentication and PermitRootLogin', 'AllowUsers and AllowGroups', 'Modern KEX and cipher selection', 'MaxAuthTries and LoginGraceTime', 'Testing config with sshd -T'],
          quiz: [
            ['Why check sshd -T before restarting sshd?', 'A syntax error would lock you out of a remote host.'],
            ['Does changing the SSH port improve security?', 'Marginally, by cutting log noise; it is not a control against a targeted attacker.'],
          ],
          prereqs: ['Users, groups and the root account'],
        },
        {
          title: 'SSH keys, agents and certificates',
          description: 'Generating ed25519 keys with passphrases, authorized_keys options (from=, command=, no-pty), agent forwarding risks versus ProxyJump, and SSH certificate authorities that issue short-lived signed keys so authorized_keys files no longer sprawl across servers.',
          concepts: ['ed25519 keys and passphrases', 'authorized_keys restrictions', 'Agent forwarding versus ProxyJump', 'SSH certificate authorities', 'Short-lived certificate workflows'],
          quiz: [
            ['Why prefer ProxyJump over agent forwarding?', 'The jump host never gets access to your agent socket, so it cannot use your key.'],
            ['What does an SSH CA change operationally?', 'Servers trust one CA public key; users get short-lived signed certs instead of static keys on every host.'],
          ],
          prereqs: ['SSH server hardening'],
        },
        {
          title: 'sudo configuration and policy',
          description: 'Writing sudoers rules with visudo, granting specific commands to specific groups instead of ALL, the danger of wildcards and shell-escaping commands (vim, less, find), NOPASSWD trade-offs, and sudo logging and timeouts.',
          concepts: ['visudo and sudoers syntax', 'Command-specific grants', 'GTFOBins-style shell escapes', 'NOPASSWD and timestamp_timeout', 'sudo logging and log_input'],
          quiz: [
            ['Why is allowing sudo vim a full root grant?', 'vim can run :!sh, giving a root shell.'],
            ['What does sudo -l show?', 'The commands the current user may run with sudo on this host.'],
          ],
          prereqs: ['Users, groups and the root account'],
        },
        {
          title: 'Privilege separation and service accounts',
          description: 'Running each daemon as its own unprivileged user, dropping privileges after binding low ports, chroot and its limits, and why a compromised web server should not be able to read the database config of another service on the same host.',
          concepts: ['One user per service', 'Dropping privileges after startup', 'chroot and its escape limits', 'Separating config secrets by owner', 'Defence when one service falls'],
          quiz: [
            ['Why does nginx start as root then switch to www-data?', 'Only root can bind port 80; workers drop privileges so exploits land as www-data.'],
            ['Is chroot a security boundary?', 'Not on its own; a root process inside can escape, so pair it with dropped privileges or namespaces.'],
          ],
          prereqs: ['Linux capabilities'],
        },
        {
          title: 'PAM and login controls',
          description: 'How the PAM stack (auth, account, password, session) decides a login, adding lockout with pam_faillock, password quality with pam_pwquality, limits on sessions, and why editing PAM without a second root shell open is a classic self-lockout.',
          concepts: ['PAM module types and stacking', 'pam_faillock lockout policy', 'pam_pwquality rules', 'Session limits and login.defs', 'Testing PAM changes safely'],
          quiz: [
            ['What is the difference between the auth and account PAM types?', 'auth verifies the credential; account checks whether the account may log in (expiry, time, lockout).'],
            ['What does pam_faillock deny=5 unlock_time=900 do?', 'Locks the account after five failures for 15 minutes.'],
          ],
          prereqs: ['sudo configuration and policy'],
        },
      ],
    },
    {
      title: 'Mandatory Access Control',
      description: 'Policies the kernel enforces even against root and even when file permissions say yes.',
      topics: [
        {
          title: 'SELinux concepts and modes',
          description: 'Labels on every process and file (user:role:type:level), type enforcement rules that decide which domain may touch which type, enforcing versus permissive versus disabled, and reading a label with ls -Z and ps -Z.',
          concepts: ['Security contexts and labels', 'Type enforcement domains', 'Enforcing, permissive, disabled', 'Targeted versus MLS policy', 'Booleans for policy tuning'],
          quiz: [
            ['What does setenforce 0 do?', 'Switches to permissive mode: denials are logged but not blocked, until reboot.'],
            ['Why does a file copied into /var/www still fail to serve?', 'It kept its old label; restorecon -Rv /var/www relabels it to httpd_sys_content_t.'],
          ],
          prereqs: ['Users, groups and the root account'],
        },
        {
          title: 'SELinux troubleshooting and policy modules',
          description: 'Reading AVC denials with ausearch and sealert, deciding between a boolean, a relabel or a custom module, generating one with audit2allow, and why blindly allowing everything audit2allow proposes defeats the point.',
          concepts: ['Reading AVC denials', 'Fixing with booleans or relabels', 'audit2allow and custom modules', 'semanage for ports and fcontext', 'Avoiding over-permissive modules'],
          quiz: [
            ['Command to see recent SELinux denials?', 'ausearch -m avc -ts recent'],
            ['How do you let httpd listen on port 8081?', 'semanage port -a -t http_port_t -p tcp 8081'],
          ],
          prereqs: ['SELinux concepts and modes'],
        },
        {
          title: 'AppArmor profiles',
          description: 'Path-based confinement on Ubuntu and SUSE: profile syntax listing files, capabilities and network access a program may use, complain versus enforce mode, aa-genprof to build a profile from observed behaviour, and how it compares with SELinux.',
          concepts: ['Path-based profile rules', 'Complain versus enforce mode', 'Generating profiles with aa-genprof', 'aa-status and profile loading', 'AppArmor versus SELinux trade-offs'],
          quiz: [
            ['What is the main model difference between AppArmor and SELinux?', 'AppArmor confines by file path; SELinux by labels attached to inodes.'],
            ['How do you put one profile into complain mode?', 'aa-complain /etc/apparmor.d/<profile>'],
          ],
          prereqs: ['SELinux concepts and modes'],
        },
      ],
    },
    {
      title: 'Auditing, Logging and Integrity',
      description: 'Knowing what happened, proving the logs were not altered, and spotting changed files.',
      topics: [
        {
          title: 'auditd rules and searching audit logs',
          description: 'The Linux audit subsystem: watch rules on files (-w /etc/passwd -p wa), syscall rules on execve and privilege changes, keys for grouping, immutable rule sets, and mining the log with ausearch and aureport for who changed what and when.',
          concepts: ['File watch rules', 'Syscall rules and filters', 'Rule keys and ordering', 'ausearch and aureport queries', 'Immutable audit configuration'],
          quiz: [
            ['What does -w /etc/sudoers -p wa -k sudoers do?', 'Logs every write or attribute change to /etc/sudoers, tagged with key sudoers.'],
            ['What does -e 2 at the end of audit.rules mean?', 'Rules become immutable until reboot; even root cannot change them.'],
          ],
          prereqs: ['setuid, setgid and the sticky bit'],
        },
        {
          title: 'System logging with journald and rsyslog',
          description: 'How journald captures stdout, syslog and kernel messages with metadata, querying it with journalctl filters, persistent storage, forwarding to rsyslog, and the files under /var/log (auth.log, secure, wtmp, btmp) that matter most for security.',
          concepts: ['journalctl filtering by unit and priority', 'Persistent journal storage', 'rsyslog rules and templates', 'auth.log and secure', 'wtmp, btmp and lastlog'],
          quiz: [
            ['Which command shows failed logins?', 'lastb, reading /var/log/btmp.'],
            ['How do you follow sshd logs only?', 'journalctl -u ssh -f (or -u sshd on RHEL).'],
          ],
        },
        {
          title: 'Centralising logs and protecting log integrity',
          description: 'Shipping logs off-host with rsyslog over TLS, syslog-ng or an agent so an attacker who gains root cannot erase the evidence, retention, time synchronisation with chrony, and append-only or write-once storage for the central copy.',
          concepts: ['rsyslog forwarding over TLS', 'Agents and structured shipping', 'Time sync with chrony', 'Write-once retention', 'Detecting log gaps'],
          quiz: [
            ['Why ship logs off the host?', 'A root-level intruder can delete local logs; the remote copy preserves the record.'],
            ['Why does clock drift matter for logs?', 'Correlating events across hosts needs consistent timestamps.'],
          ],
          prereqs: ['System logging with journald and rsyslog'],
        },
        {
          title: 'File integrity monitoring with AIDE',
          description: 'Building a baseline database of hashes, permissions and attributes for system paths, scheduling comparisons, reading the report, keeping the baseline off-host so it cannot be tampered with, and updating it after legitimate patching.',
          concepts: ['Baseline database creation', 'Rule sets and monitored paths', 'Scheduled checks and reports', 'Protecting the baseline off-host', 'Re-baselining after patches'],
          quiz: [
            ['Why store the AIDE database off the monitored host?', 'An attacker with root could otherwise regenerate it after modifying files.'],
            ['What does a changed /usr/bin/ssh in an AIDE report suggest if no patch ran?', 'A possible trojaned binary; investigate before trusting the host.'],
          ],
          prereqs: ['auditd rules and searching audit logs'],
        },
        {
          title: 'Detecting configuration drift',
          description: 'Comparing running state with the intended baseline: rerunning Lynis or OpenSCAP, diffing package lists, checking sudoers and sshd_config against version control, and turning findings into alerts so hardening does not silently decay.',
          concepts: ['Scheduled compliance scans', 'Config in version control', 'Package list diffs', 'Alerting on drift', 'Drift as an incident signal'],
          quiz: [
            ['Why can drift be a security signal?', 'An unexpected new user, cron job or package may indicate compromise, not just sloppiness.'],
            ['How do you compare installed packages between two hosts?', 'Export dpkg -l or rpm -qa from each and diff the sorted lists.'],
          ],
          prereqs: ['CIS benchmarks and hardening baselines', 'File integrity monitoring with AIDE'],
        },
      ],
    },
    {
      title: 'Network and Service Hardening',
      description: 'Limiting what can reach a host and what a service can do once it is running.',
      topics: [
        {
          title: 'nftables firewalling',
          description: 'The modern Linux packet filter: tables, chains with hooks and priorities, default-deny input policy, allowing established connections and specific ports, sets for IP lists, logging dropped packets, and saving rules so they survive reboot.',
          concepts: ['Tables, chains and hooks', 'Default-deny input policy', 'Stateful rules with ct state', 'Sets for address lists', 'Logging and persisting rules'],
          quiz: [
            ['What does ct state established,related accept do?', 'Allows return traffic for connections the host initiated.'],
            ['How do you make nftables rules persistent?', 'Save them to /etc/nftables.conf and enable the nftables service.'],
          ],
          prereqs: ['Minimal installs and attack surface reduction'],
        },
        {
          title: 'ufw and firewalld front ends',
          description: 'Simpler wrappers over nftables: ufw allow and deny with rate limiting on Ubuntu, firewalld zones, services and rich rules on RHEL, and how to see the generated rules so you know what the abstraction actually enforces.',
          concepts: ['ufw allow, deny and limit', 'firewalld zones and services', 'Rich rules and port forwarding', 'Inspecting generated nft rules', 'Choosing between ufw and nftables'],
          quiz: [
            ['What does ufw limit ssh do?', 'Allows SSH but blocks an IP after six connections in 30 seconds.'],
            ['What is a firewalld zone?', 'A named trust level with its own rules, bound to interfaces or sources.'],
          ],
          prereqs: ['nftables firewalling'],
        },
        {
          title: 'systemd service sandboxing',
          description: 'Unit directives that confine a daemon without touching its code: ProtectSystem, ProtectHome, PrivateTmp, NoNewPrivileges, CapabilityBoundingSet, SystemCallFilter and RestrictAddressFamilies, measured with systemd-analyze security.',
          concepts: ['ProtectSystem and ProtectHome', 'PrivateTmp and PrivateDevices', 'NoNewPrivileges and capability sets', 'SystemCallFilter with seccomp', 'systemd-analyze security scoring'],
          quiz: [
            ['What does NoNewPrivileges=yes prevent?', 'The service and its children gaining privileges via setuid binaries or capabilities.'],
            ['What does ProtectSystem=strict do?', 'Mounts the whole filesystem read-only for the service except paths listed in ReadWritePaths.'],
          ],
          prereqs: ['Privilege separation and service accounts'],
        },
        {
          title: 'Hardening common network services',
          description: 'Applying the same checklist to nginx, PostgreSQL and similar: bind to localhost or specific interfaces, TLS with modern settings, authentication for every exposed endpoint, per-service users and directories, version banners off, and rate limits.',
          concepts: ['Binding to the right interface', 'TLS and modern ciphers per service', 'Hiding version banners', 'Service-level rate limiting', 'Reviewing default configs'],
          quiz: [
            ['Why bind PostgreSQL to 127.0.0.1 by default?', 'Only local processes can connect; remote access must be deliberately enabled with authentication.'],
            ['What is the risk of a version banner?', 'It lets scanners match the exact software version to known CVEs.'],
          ],
          prereqs: ['nftables firewalling'],
        },
        {
          title: 'Brute-force protection with fail2ban',
          description: 'Watching logs for repeated failures and banning the source with a firewall rule for a while: jails, filters as regexes, findtime and maxretry, ignoring trusted networks, and why it complements but does not replace key-only SSH.',
          concepts: ['Jails and filters', 'findtime, maxretry and bantime', 'Ban actions via nftables', 'ignoreip for trusted sources', 'Limits against distributed attacks'],
          quiz: [
            ['What does fail2ban-client status sshd show?', 'Current and total banned IPs for the sshd jail.'],
            ['Why does fail2ban not stop password spraying from a botnet?', 'Each IP stays under maxretry; you need key-only auth or MFA.'],
          ],
          prereqs: ['ufw and firewalld front ends', 'SSH server hardening'],
        },
      ],
    },
    {
      title: 'Malware, Rootkits and Detection',
      description: 'What compromise looks like on Linux and how to find it with built-in tools.',
      topics: [
        {
          title: 'Linux malware and persistence mechanisms',
          description: 'Cryptominers, web shells, SSH backdoors and botnet agents, and where they hide to survive reboot: cron and at, systemd units and timers, rc.local, shell profiles, LD_PRELOAD in /etc/ld.so.preload, authorized_keys additions and PAM modules.',
          concepts: ['Cryptominers and web shells', 'cron, at and systemd timers', 'Shell profile and rc hooks', 'LD_PRELOAD hijacking', 'authorized_keys and PAM backdoors'],
          quiz: [
            ['Why is /etc/ld.so.preload a red flag?', 'Any library listed loads into every dynamically linked process, a classic userland rootkit hook.'],
            ['Where would you look for a persistence timer?', 'systemctl list-timers --all and unit files in /etc/systemd/system.'],
          ],
          prereqs: ['Users, groups and the root account'],
        },
        {
          title: 'Rootkit detection with rkhunter and chkrootkit',
          description: 'Signature and heuristic checks for known rootkits, hidden files, modified binaries and suspicious kernel modules, how to run them from a known-good environment, and why a positive result means image the disk rather than clean in place.',
          concepts: ['rkhunter checks and property database', 'chkrootkit heuristics', 'Kernel module rootkits', 'Running from trusted media', 'Rebuild versus clean'],
          quiz: [
            ['Why run detection tools from a live USB?', 'A kernel rootkit can lie to tools running on the compromised kernel.'],
            ['What does rkhunter --propupd do?', 'Updates its baseline of file properties; run only on a known-clean system.'],
          ],
          prereqs: ['Linux malware and persistence mechanisms'],
        },
        {
          title: 'Live process and network inspection',
          description: 'Finding what is really running: ps with parent trees, /proc/<pid>/exe and cmdline for deleted or masqueraded binaries, ss and lsof for unexpected connections, cross-checking with a second tool to catch hidden processes.',
          concepts: ['ps trees and parent processes', '/proc exe, cwd and cmdline', 'Deleted-binary processes', 'ss and lsof for connections', 'Cross-checking for hidden PIDs'],
          quiz: [
            ['What does (deleted) after /proc/<pid>/exe mean?', 'The binary was removed from disk after starting, common for droppers and miners.'],
            ['How can you spot a hidden process?', 'Compare PIDs in /proc with ps output; a PID present in /proc but missing from ps suggests hooking.'],
          ],
          prereqs: ['Linux malware and persistence mechanisms'],
        },
        {
          title: 'Scanning with ClamAV and YARA',
          description: 'Signature scanning of uploads and shares with ClamAV and clamd, on-access scanning trade-offs, writing YARA rules that match strings and byte patterns in files or memory, and using both as one layer, not the whole defence.',
          concepts: ['clamscan and clamd', 'Freshclam signature updates', 'YARA rule syntax', 'Scanning memory and uploads', 'Signature limits on Linux'],
          quiz: [
            ['What is a YARA rule made of?', 'Strings or hex patterns plus a condition on how many must match.'],
            ['Why is ClamAV weak against fresh malware?', 'It is signature-based; new or packed samples have no signature yet.'],
          ],
          prereqs: ['Rootkit detection with rkhunter and chkrootkit'],
        },
      ],
    },
    {
      title: 'Containers, Kernel and Disk',
      description: 'The isolation primitives under containers, and the kernel and disk features that back them.',
      topics: [
        {
          title: 'Namespaces, cgroups and container isolation',
          description: 'What actually isolates a container: PID, mount, network, user and other namespaces, cgroups for resource limits, why a container root is often host root without user namespaces, and how docker exec or nsenter enters them.',
          concepts: ['Namespace types', 'cgroups resource limits', 'User namespaces and UID mapping', 'Shared kernel implications', 'nsenter and inspection'],
          quiz: [
            ['Why is container escape possible in principle?', 'Containers share the host kernel; a kernel bug or a privileged mount crosses the boundary.'],
            ['What do user namespaces change?', 'Root inside the container maps to an unprivileged UID on the host.'],
          ],
          prereqs: ['Linux capabilities'],
        },
        {
          title: 'Container hardening',
          description: 'Rootless runtimes, dropping all capabilities and adding back only what is needed, read-only root filesystems, seccomp and AppArmor profiles, never mounting the Docker socket, minimal or distroless images, and scanning images with Trivy or Grype.',
          concepts: ['Rootless containers', 'Dropping capabilities per container', 'Read-only filesystems and no-new-privileges', 'Docker socket exposure', 'Image scanning with Trivy'],
          quiz: [
            ['Why is mounting /var/run/docker.sock into a container dangerous?', 'It grants control of the Docker daemon, equivalent to root on the host.'],
            ['What does --cap-drop ALL --cap-add NET_BIND_SERVICE do?', 'Removes every capability except binding low ports.'],
          ],
          prereqs: ['Namespaces, cgroups and container isolation'],
        },
        {
          title: 'Kernel security features',
          description: 'Mitigations built into the kernel: ASLR and KASLR, stack protectors, kernel lockdown mode, module signing, seccomp filters, eBPF restrictions, and how to check which are active on a running system.',
          concepts: ['ASLR and KASLR', 'Kernel lockdown and module signing', 'seccomp-bpf filters', 'eBPF and unprivileged access', 'Checking mitigations in /sys and /proc'],
          quiz: [
            ['What does kernel.randomize_va_space=2 enable?', 'Full ASLR, including randomised heap (brk) placement.'],
            ['What does lockdown integrity mode block?', 'Loading unsigned modules and other root-level ways to modify the running kernel.'],
          ],
          prereqs: ['Boot, kernel parameters and sysctl'],
        },
        {
          title: 'Full-disk encryption with LUKS and TPM',
          description: 'Encrypting volumes with LUKS2 and cryptsetup, key slots and passphrase changes, unlocking with a TPM measured boot or a network key server, and the limits: encryption protects a powered-off disk, not a running host.',
          concepts: ['LUKS2 and cryptsetup', 'Key slots and recovery keys', 'TPM-bound unlocking', 'Encrypted swap and /home', 'What FDE does not protect'],
          quiz: [
            ['Does full-disk encryption protect against a remote intruder on a running server?', 'No; the volume is mounted and readable while the system runs.'],
            ['Why keep more than one LUKS key slot?', 'A recovery passphrase survives a lost TPM or a forgotten primary passphrase.'],
          ],
          prereqs: ['Kernel security features'],
        },
      ],
    },
    {
      title: 'Windows Security Essentials',
      description: 'Enough Windows to contrast with Linux and to hold your own in a mixed environment.',
      topics: [
        {
          title: 'Windows accounts, tokens and UAC',
          description: 'SIDs, local versus domain accounts, the access token attached to every process with its groups and privileges, integrity levels, and how User Account Control splits an administrator session into a filtered and an elevated token.',
          concepts: ['SIDs and well-known accounts', 'Access tokens and privileges', 'Integrity levels', 'UAC split tokens', 'Local Administrators group risks'],
          quiz: [
            ['What is the Windows analogue of a UID?', 'The SID (security identifier).'],
            ['Why is UAC not a security boundary according to Microsoft?', 'Auto-elevation bypasses exist; it is a convenience prompt for administrators, not isolation.'],
          ],
          prereqs: ['Users, groups and the root account'],
        },
        {
          title: 'Active Directory concepts',
          description: 'Domains, forests and trusts, domain controllers, Kerberos ticket flow (TGT and service tickets), NTLM as the legacy fallback, organisational units and groups, and why Domain Admins and the krbtgt account are the crown jewels attackers chase.',
          concepts: ['Domains, forests and trusts', 'Kerberos TGT and service tickets', 'NTLM legacy authentication', 'OUs and group nesting', 'Tier 0 assets'],
          quiz: [
            ['What does a TGT prove?', 'That the user authenticated to the KDC; it is exchanged for service tickets.'],
            ['Why is the krbtgt account critical?', 'Its key signs all TGTs; compromise allows forging golden tickets.'],
          ],
          prereqs: ['Windows accounts, tokens and UAC'],
        },
        {
          title: 'Group Policy hardening',
          description: 'Using Group Policy Objects to push baselines domain-wide: password and lockout policy, audit policy, disabling LLMNR and NTLMv1, restricting local admin, LAPS for unique local passwords, and Microsoft security baselines as the starting point.',
          concepts: ['GPO scope and precedence', 'Password and lockout policy', 'Disabling LLMNR and NTLMv1', 'LAPS for local admin passwords', 'Microsoft security baselines'],
          quiz: [
            ['Why disable LLMNR?', 'It lets an attacker on the LAN answer name lookups and capture credential hashes.'],
            ['What problem does LAPS solve?', 'Identical local administrator passwords across machines that enable lateral movement.'],
          ],
          prereqs: ['Active Directory concepts'],
        },
        {
          title: 'Defender, AppLocker and Windows event logging',
          description: 'Microsoft Defender antivirus and attack surface reduction rules, application control with AppLocker or WDAC, PowerShell logging (script block, transcription), Sysmon, and the event IDs (4624, 4688, 4720) analysts read first.',
          concepts: ['Defender and ASR rules', 'AppLocker and WDAC policies', 'PowerShell script block logging', 'Sysmon telemetry', 'Key security event IDs'],
          quiz: [
            ['What does event ID 4688 record?', 'Process creation, including the command line if enabled.'],
            ['What is the point of application allow-listing?', 'Only approved binaries run, so unknown malware is blocked regardless of signatures.'],
          ],
          prereqs: ['Group Policy hardening'],
        },
      ],
    },
    {
      title: 'Linux Forensics Basics',
      description: 'Preserving and reading evidence from a Linux host without destroying it.',
      topics: [
        {
          title: 'Order of volatility and live response',
          description: 'Collecting the most fleeting evidence first (memory, network connections, running processes, then disk), using trusted static binaries, recording every command with timestamps, and avoiding actions that overwrite artefacts such as rebooting or running updates.',
          concepts: ['Order of volatility', 'Trusted static binaries', 'Live collection checklist', 'Memory capture with LiME or AVML', 'Chain of custody notes'],
          quiz: [
            ['Why capture memory before imaging disk?', 'Memory is lost on power-off and holds keys, processes and network state.'],
            ['Why bring your own binaries to a compromised host?', 'The host\'s ps, ls and netstat may be trojaned.'],
          ],
          prereqs: ['Live process and network inspection'],
        },
        {
          title: 'Disk imaging and timeline analysis',
          description: 'Creating a bit-for-bit image with dd or dc3dd, hashing it for integrity, mounting read-only with loop devices, and building a filesystem timeline with The Sleuth Kit (fls, mactime) to see what changed around the time of compromise.',
          concepts: ['Imaging with dd and dc3dd', 'Hashing images for integrity', 'Read-only loop mounts', 'fls and mactime timelines', 'Interpreting MAC times'],
          quiz: [
            ['Why hash a disk image immediately?', 'To prove later that the analysed copy matches the original.'],
            ['What does mactime produce?', 'A chronological list of file modified, accessed, changed and birth times.'],
          ],
          prereqs: ['Order of volatility and live response'],
        },
        {
          title: 'Log and artefact analysis on Linux',
          description: 'Reconstructing activity from auth logs, journal, bash history (and its gaps), wtmp and btmp, cron logs, package manager history, web server access logs and SSH known_hosts, and correlating them into a single narrative with timestamps.',
          concepts: ['Login records and sessions', 'Shell history and its limits', 'Package and cron history', 'Web server access logs', 'Building the incident narrative'],
          quiz: [
            ['Why can bash history be misleading?', 'It is written on exit, can be disabled with HISTFILE unset, and is trivially edited.'],
            ['Which log shows a package installed by an attacker?', '/var/log/apt/history.log or dnf history.'],
          ],
          prereqs: ['System logging with journald and rsyslog', 'Disk imaging and timeline analysis'],
        },
      ],
    },
    {
      title: 'Projects and Interview Preparation',
      description: 'Defensive lab work on your own VMs and containers, then interview practice.',
      topics: [
        {
          title: 'Project: CIS-hardened Ubuntu server with automated audit',
          description: 'Take a fresh Ubuntu VM, apply CIS Level 1 with an Ansible role or script (SSH, sudo, sysctl, auditd, nftables, AIDE), run Lynis before and after, and produce a report showing the score change with every exception justified.',
          concepts: ['Baseline the fresh VM with Lynis', 'Apply hardening with Ansible', 'Configure auditd, nftables and AIDE', 'Re-scan and write the exception report'],
          quiz: [
            ['What proves the hardening worked?', 'A repeatable scan showing the controls pass, plus a re-run after reboot.'],
            ['Why keep the playbook in version control?', 'Drift detection and re-application on new hosts.'],
          ],
          style: 'project',
          prereqs: ['Detecting configuration drift', 'nftables firewalling'],
        },
        {
          title: 'Project: SSH certificate authority and bastion',
          description: 'Build a bastion VM behind nftables that only accepts SSH certificates from your own CA, issue short-lived user certificates with principals, configure ProxyJump to two internal VMs, and log every session with auditd and fail2ban in place.',
          concepts: ['Create the CA and trust it on hosts', 'Issue short-lived user certificates', 'Configure the bastion and ProxyJump', 'Verify logging and lockout'],
          quiz: [
            ['What must each server have to trust the CA?', 'TrustedUserCAKeys pointing at the CA public key in sshd_config.'],
            ['How do you limit a certificate to one user?', 'Set principals when signing; servers match them against the login name.'],
          ],
          style: 'project',
          prereqs: ['SSH keys, agents and certificates', 'Brute-force protection with fail2ban'],
        },
        {
          title: 'Project: confined service with SELinux and systemd sandboxing',
          description: 'Deploy a small Python web service on a RHEL-family VM under its own user, write or adapt an SELinux policy module for it, add systemd sandboxing directives until systemd-analyze security reports a low score, and show the denials when the service misbehaves.',
          concepts: ['Deploy the service as its own user', 'Write the SELinux policy module', 'Add systemd sandboxing directives', 'Demonstrate blocked misbehaviour'],
          quiz: [
            ['How do you prove SELinux is confining the service?', 'Make it attempt a forbidden action and show the AVC denial in ausearch.'],
            ['What score does systemd-analyze security give a fully unconfined unit?', 'Around 9.6, labelled UNSAFE.'],
          ],
          style: 'project',
          prereqs: ['SELinux troubleshooting and policy modules', 'systemd service sandboxing'],
        },
        {
          title: 'Project: compromise detection and forensic write-up',
          description: 'On an isolated VM, plant benign persistence (a cron job, a systemd timer, an ld.so.preload entry, an extra authorized key) using a scripted scenario, then as the defender find every artefact with auditd, AIDE, rkhunter and manual inspection, image the disk and write a timeline report.',
          concepts: ['Run the scripted persistence scenario', 'Hunt with auditd, AIDE and rkhunter', 'Image and build the timeline', 'Write the forensic report'],
          quiz: [
            ['Which artefact is easiest to miss and why?', 'The authorized_keys addition; it looks legitimate and generates little noise.'],
            ['What goes in the report timeline?', 'Each artefact with its timestamp, the evidence source and how it was found.'],
          ],
          style: 'project',
          prereqs: ['Log and artefact analysis on Linux', 'Scanning with ClamAV and YARA'],
        },
        {
          title: 'Linux security interview questions',
          description: 'What interviewers ask for system, platform and security engineering roles: explain setuid, what SELinux enforcing means, how you would harden a fresh server, the difference between capabilities and root, what to check when a host looks compromised.',
          concepts: ['Explaining the permission model', 'Hardening checklist answers', 'MAC and sandboxing questions', 'Compromise triage answers'],
          quiz: [
            ['You get root on a new server: first five hardening steps?', 'Patch, key-only SSH with no root login, restrictive sudo, default-deny firewall, enable auditd and log shipping.'],
            ['Difference between DAC and MAC?', 'DAC lets owners set permissions; MAC is a system policy enforced regardless of owner, even for root.'],
          ],
          style: 'reading',
        },
        {
          title: 'Linux troubleshooting and scenario questions',
          description: 'Walk-through scenarios: a web server is mining crypto, sudo suddenly prompts for a password in automation, SELinux blocks a legitimate app, a developer wants Docker socket access; structuring an answer that investigates before fixing and preserves evidence.',
          concepts: ['Investigate-before-fix structure', 'Explaining evidence preservation', 'Balancing usability and hardening', 'Explaining trade-offs to developers'],
          quiz: [
            ['A server shows 100% CPU from an unknown process: first steps?', 'Do not kill it yet; capture ps, /proc details, connections, then isolate the host and preserve evidence.'],
            ['A developer asks for docker group membership: response?', 'Explain it equals root, offer rootless Docker or a scoped CI runner instead.'],
          ],
          style: 'reading',
        },
      ],
    },
  ],
})
