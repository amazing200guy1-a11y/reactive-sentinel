# DoraHacks Submission Guide — ReactiveSentinel
> **Reactive Omni Buildathon 2026 ($5,500 USD)**

---

## 📌 Project Overview
- **Project Name**: ReactiveSentinel
- **Tagline**: Autonomous Zero-Trust Cross-Chain Circuit Breaker & Liquidity Defense Engine on Reactive Network
- **Track**: Infrastructure & Tooling / DeFi & Cross-Chain Automation
- **GitHub Repository**: `https://github.com/amazing200guy1-a11y/reactive-sentinel`
- **Live Demo Dashboard**: `https://amazing200guy1-a11y.github.io/reactive-sentinel/dashboard.html`

---

## 📝 Short Description (1-2 sentences)
ReactiveSentinel is an autonomous, on-chain cross-chain circuit breaker built on Reactive Network. It autonomously catches flash-loan, slippage, and exploit event logs on origin chains (Base/Ethereum) and triggers sub-block callbacks to freeze destination vaults on Arbitrum, eliminating centralized keeper bots.

---

## 📖 Detailed Project Description

### Problem: The Cross-Chain Latency Exploitation Gap
In modern multi-chain DeFi, when an exploit strikes (flash-loan manipulation, oracle corruption, or sandwich drain), destination chain liquidity gets drained before off-chain keeper bots or multi-sig signers can react. Off-chain bots are susceptible to network congestion, RPC downtime, gas bidding wars, and centralized single points of failure.

### Solution: Autonomous On-Chain Reactivity
ReactiveSentinel utilizes Reactive Smart Contracts (RSC) on the Reactive Network. Instead of relying on off-chain relayers:
1. `ReactiveSentinel` subscribes to raw origin event logs across EVM chains (Base, Ethereum) via `ISubscriptionService`.
2. When an anomaly occurs, ReactVM invokes `react(LogRecord calldata log)` directly on-chain.
3. The deterministic anomaly engine evaluates volume spikes, toxic slippage (> 5.00%), and exploit topic signatures.
4. If a threat is identified, `ReactiveSentinel` dispatches an autonomous `Callback` event targeted at `DestinationVault.tripCircuitBreaker()`, freezing deposits and preserving liquidity in < 1 block.

### Technical Implementation:
- **Solidity ^0.8.0 Contracts**:
  - `contracts/ReactiveSentinel.sol`: Core Reactive contract implementing `IReactive` and `IPayer`.
  - `contracts/DestinationVault.sol`: Destination vault recipient of autonomous callbacks.
- **Pure Node.js Verification Engine**:
  - `src/reactive_simulator.js`: Complete ReactVM event simulation engine with zero NPM dependencies.
  - `test/reactive_sentinel.test.js`: 10/10 automated tests executing in < 0.02ms.
- **Titanium HUD Cockpit**:
  - `dashboard.html`: Live interactive cross-chain block monitor and real-time attack simulation cockpit.

---

## 🔗 Submission Links & Artifacts
- **GitHub Repository**: `https://github.com/amazing200guy1-a11y/reactive-sentinel`
- **Live Dashboard**: `https://amazing200guy1-a11y.github.io/reactive-sentinel/dashboard.html`
- **EVM Reward Address**: `0x2D992B91DE7c1E2172beBECB0508841AC53985e8`
