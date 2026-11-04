/**
 * ReactiveSentinel Automated Test Suite
 * Pure Node.js Standard Library (0 NPM dependencies)
 * Tests Reactive Smart Contract event processing, cross-chain callbacks, and latency
 */

const assert = require('assert');
const { ReactiveSentinelEngine, DestinationVaultSimulator } = require('../src/reactive_simulator');

console.log('================================================================');
console.log('⚡ REACTIVESENTINEL — AUTONOMOUS CROSS-CHAIN CIRCUIT BREAKER TEST');
console.log('   Reactive Network Omni Buildathon Evaluation Suite');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  [PASS] Test ${totalTests}: ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  [FAIL] Test ${totalTests}: ${name}`);
        console.error(`         ${err.message}`);
    }
}

const engine = new ReactiveSentinelEngine({
    maxVolumeThreshold: 100.0,
    maxSlippageBps: 500
});

const vault = new DestinationVaultSimulator('0xReactiveSentinelAddress');

// Test 1: Initialization
runTest('Engine initializes with zero state and active configuration', () => {
    assert.strictEqual(engine.totalEventsProcessed, 0);
    assert.strictEqual(engine.totalThreatsNeutralized, 0);
    assert.strictEqual(engine.isTripped, false);
    assert.strictEqual(engine.maxVolumeThreshold, 100.0);
});

// Test 2: Subscribing to Threat Feed
runTest('Registers origin chain event subscriptions (Base chain 8453)', () => {
    const res = engine.subscribeThreatFeed(8453, '0xAerodromePool', '0xSwapEventTopic');
    assert.strictEqual(res.success, true);
    assert.strictEqual(engine.monitoredFeeds.has('8453:0xaerodromepool'), true);
});

// Test 3: Setting Destination Vault
runTest('Configures protected destination vault on Arbitrum (42161)', () => {
    const res = engine.setDestinationVault(42161, '0xDestinationVaultOnArbitrum');
    assert.strictEqual(res.success, true);
    assert.strictEqual(engine.destinationVaults.get(42161), '0xDestinationVaultOnArbitrum');
});

// Test 4: Processing Benign Event
runTest('Allows normal benign swap volume without tripping circuit breaker', () => {
    const benignLog = {
        chain_id: 8453,
        _contract: '0xAerodromePool',
        tx_hash: '0x1111111111111111',
        volume: 12.5,
        slippageBps: 45,
        topic_1: '0x00',
        topic_2: '0x00'
    };
    const res = engine.react(benignLog);
    assert.strictEqual(res.threatResult.isMalicious, false);
    assert.strictEqual(engine.isTripped, false);
    assert.strictEqual(res.callbackDispatched, false);
});

// Test 5: Intercepting Flash-Loan Volume Spike
runTest('Detects and neutralizes flash-loan anomaly (500 ETH volume)', () => {
    const maliciousLog = {
        chain_id: 42161,
        _contract: '0xLendingPool',
        tx_hash: '0x2222222222222222',
        volume: 500.0, // Exceeds 100 ETH limit
        slippageBps: 50,
        topic_1: '0x00',
        topic_2: '0x00'
    };
    const res = engine.react(maliciousLog);
    assert.strictEqual(res.threatResult.isMalicious, true);
    assert.strictEqual(res.threatResult.anomalyScore, 96);
    assert.strictEqual(engine.isTripped, true);
    assert.strictEqual(res.callbackDispatched, true);
    assert.strictEqual(res.callbackEvent.target_contract, '0xDestinationVaultOnArbitrum');
});

// Test 6: Cross-Chain Callback Secures Destination Vault
runTest('Autonomous callback executes on destination vault and freezes deposits', () => {
    const res = vault.tripCircuitBreaker('0x2222222222222222', 96, 'Flash-loan spike');
    assert.strictEqual(res.status, 'EMERGENCY_PAUSED');
    assert.strictEqual(vault.isPaused, true);
    assert.strictEqual(res.lockedValuePreserved, 1500.0);

    // Verify deposit rejection
    assert.throws(() => {
        vault.deposit('0xTrader', 10.0);
    }, /EMERGENCY_PAUSE_ACTIVE/);
});

// Test 7: Intercepting Toxic Slippage Attack
runTest('Neutralizes sandwich attack with 12.5% slippage (1250 bps)', () => {
    const slippageLog = {
        chain_id: 8453,
        _contract: '0xAerodromePool',
        tx_hash: '0x3333333333333333',
        volume: 20.0,
        slippageBps: 1250, // 12.5% > 5% max
        topic_1: '0x00',
        topic_2: '0x00'
    };
    const res = engine.react(slippageLog);
    assert.strictEqual(res.threatResult.isMalicious, true);
    assert.strictEqual(res.threatResult.anomalyScore, 92);
});

// Test 8: Intercepting Blacklisted Exploit Signature
runTest('Catches zero-day re-entrancy attack signature (0xdeadbeef)', () => {
    const exploitLog = {
        chain_id: 8453,
        _contract: '0xVulnerableProtocol',
        tx_hash: '0x4444444444444444',
        volume: 5.0,
        slippageBps: 20,
        topic_1: '0xdeadbeef',
        topic_2: '0x00'
    };
    const res = engine.react(exploitLog);
    assert.strictEqual(res.threatResult.isMalicious, true);
    assert.strictEqual(res.threatResult.anomalyScore, 99);
});

// Test 9: Circuit Breaker Reset
runTest('Allows authorized admin to reset circuit breaker and restore normal telemetry', () => {
    const res = engine.resetCircuitBreaker();
    assert.strictEqual(res.success, true);
    assert.strictEqual(engine.isTripped, false);

    const vaultResume = vault.resume();
    assert.strictEqual(vaultResume.status, 'NORMAL_OPERATIONS_RESUMED');
    assert.strictEqual(vault.isPaused, false);
});

// Test 10: Sub-millisecond Execution Latency
runTest('Deterministic threat evaluation completes in sub-millisecond range (< 1ms)', () => {
    const perfLog = {
        chain_id: 8453,
        _contract: '0xHighFreqPool',
        tx_hash: '0x5555555555555555',
        volume: 50.0,
        slippageBps: 100,
        topic_1: '0x00',
        topic_2: '0x00'
    };
    const res = engine.react(perfLog);
    assert.ok(res.latencyMs < 1.0, `Latency was ${res.latencyMs}ms (expected < 1.0ms)`);
});

console.log('\n================================================================');
console.log(`SUMMARY: ${passedTests}/${totalTests} Tests Passed (${((passedTests/totalTests)*100).toFixed(0)}%)`);
console.log('================================================================\n');

if (passedTests === totalTests) {
    process.exit(0);
} else {
    process.exit(1);
}
