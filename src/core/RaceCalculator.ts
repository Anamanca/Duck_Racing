import type { 
  Player, 
  Lane, 
  DuckProfile, 
  Obstacle,
  VelocityEntry,
  FinishResult 
} from './types/race';
import { ObstacleGenerator } from './ObstacleGenerator';

export class RaceCalculator {
  
  calculateRace(
    players: Player[],
    raceMode: 'fixed' | 'random',
    raceDuration: number,
    screenWidth: number,
    screenHeight: number
  ): { lanes: Lane[]; profiles: DuckProfile[]; obstacles: Obstacle[] } {
    
    const finishResults = this.determineFinishOrder(players, raceMode);
    const lanes = this.createLanes(players.length, screenWidth, screenHeight);
    
    const profiles: DuckProfile[] = finishResults.map((result, index) => ({
      playerId: result.playerId,
      playerName: result.playerName,
      votes: result.votes,
      finishOrder: result.finishOrder,
      laneId: lanes[index].id,
      obstacles: [],
      speedBoosts: [],
      velocityTimeline: [],
      actualPath: [],
      baseVelocity: 0,
      correctionPoint: {
        xPosition: 0,
        expectedRank: result.finishOrder,
        tolerance: 50
      }
    }));
    
    profiles.forEach((profile, index) => {
      lanes[index].duckId = profile.playerId;
    });
    
    const obstacles = ObstacleGenerator.generate(
      raceDuration,
      lanes,
      screenWidth,
      screenHeight,
      5
    );
    
    this.assignObstaclesToDucks(profiles, obstacles);
    
    profiles.forEach(profile => {
      const lane = lanes.find(l => l.id === profile.laneId)!;
      this.calculateDuckTimeline(profile, lane, raceDuration);
    });
    
    return { lanes, profiles, obstacles };
  }
  
  private determineFinishOrder(players: Player[], mode: 'fixed' | 'random'): FinishResult[] {
    let sortedPlayers: Player[];
    
    if (mode === 'random') {
      sortedPlayers = [...players].sort(() => Math.random() - 0.5);
    } else {
      sortedPlayers = [...players].sort((a, b) => b.votes - a.votes);
    }
    
    return this.assignContinuousRanks(sortedPlayers);
  }
  
  private assignContinuousRanks(players: Player[]): FinishResult[] {
    const results: FinishResult[] = [];
    
    // Group players by votes
    const voteGroups = new Map<number, Player[]>();
    
    players.forEach(player => {
      if (!voteGroups.has(player.votes)) {
        voteGroups.set(player.votes, []);
      }
      voteGroups.get(player.votes)!.push(player);
    });
    
    // Sort vote values descending
    const sortedVotes = Array.from(voteGroups.keys()).sort((a, b) => b - a);
    
    // Assign ranks - Standard Competition Ranking (1224)
    // When tied, all get same rank, next rank is skipped
    let currentPosition = 1; // Position in the list (1-indexed)
    
    sortedVotes.forEach(votes => {
      const group = voteGroups.get(votes)!;
      const isTie = group.length > 1;
      
      group.forEach((player, _index) => {
        const tiePartners = isTie 
          ? group.filter(p => p.id !== player.id).map(p => p.id)
          : undefined;
        
        const result: FinishResult = {
          playerId: player.id,
          playerName: player.name,
          votes: player.votes,
          finishOrder: currentPosition, // Same rank for all in tie group
          isTie: isTie,
          tieWith: tiePartners
        };
        
        results.push(result);
      });
      
      // Move position forward by group size
      // Next group will have rank = currentPosition + group.length
      currentPosition += group.length;
    });
    
    // Sort results back to original player order for display
    // But we need to maintain the rank order, so sort by rank then name
    results.sort((a, b) => {
      if (a.finishOrder !== b.finishOrder) {
        return a.finishOrder - b.finishOrder;
      }
      return a.playerName.localeCompare(b.playerName);
    });
    
    return results;
  }
  
  private createLanes(
    duckCount: number,
    screenWidth: number,
    screenHeight: number
  ): Lane[] {
    const RIVER_START_X = screenWidth * 0.12;
    const RIVER_END_X = screenWidth * 0.92;
    const RIVER_TOP_Y = screenHeight * 0.12;
    const RIVER_BOTTOM_Y = screenHeight * 0.88;
    const RIVER_HEIGHT = RIVER_BOTTOM_Y - RIVER_TOP_Y;
    
    const laneHeight = RIVER_HEIGHT / duckCount;
    
    return Array.from({ length: duckCount }, (_, i) => {
      const laneY = RIVER_TOP_Y + (laneHeight * i) + (laneHeight / 2);
      
      return {
        id: i,
        duckId: '',
        yPosition: laneY,
        width: laneHeight * 0.8,
        startX: RIVER_START_X + 100,
        finishX: RIVER_END_X - 100,
        path: this.createLanePath(RIVER_START_X + 100, RIVER_END_X - 100, laneY)
      };
    });
  }
  
  private createLanePath(startX: number, endX: number, y: number): Path2D {
    const path = new Path2D();
    path.moveTo(startX, y);
    const midX = (startX + endX) / 2;
    const curveY = y + (Math.random() - 0.5) * 20;
    path.quadraticCurveTo(midX, curveY, endX, y);
    return path;
  }
  
  private assignObstaclesToDucks(profiles: DuckProfile[], obstacles: Obstacle[]) {
    profiles.forEach(profile => {
      profile.obstacles = obstacles.filter(obs => 
        obs.affectsLaneIds.includes(profile.laneId)
      );
    });
  }
  
  private calculateDuckTimeline(
    profile: DuckProfile,
    lane: Lane,
    raceDuration: number
  ) {
    const fps = 60;
    const trackLength = lane.finishX - lane.startX;
    
    // Calculate exact target finish time based on rank
    // Rank 1 finishes at raceDuration - 1.5s
    // Each subsequent rank adds 0.4s
    const targetFinishTime = raceDuration - 1.5 + (profile.finishOrder - 1) * 0.4;
    const totalFrames = Math.ceil(targetFinishTime * fps);
    
    profile.correctionPoint = {
      xPosition: lane.startX + trackLength * 0.7,
      expectedRank: profile.finishOrder,
      tolerance: 20
    };
    
    const defaultVelocity = trackLength / raceDuration;
    profile.baseVelocity = defaultVelocity;
    
    // Pre-calculate exact positions for perfect finish order
    const exactTimeline: { x: number; t: number }[] = [];
    for (let frame = 0; frame <= totalFrames; frame++) {
      const t = frame / fps;
      const progress = t / targetFinishTime;
      // Use easing function for natural acceleration/deceleration
      const easedProgress = this.easeInOutQuad(progress);
      const x = lane.startX + trackLength * easedProgress;
      exactTimeline.push({ x, t });
    }
    
    // Now add obstacles and variations
    let currentX = lane.startX;
    const obstacleEffects = new Set<string>();
    
    for (let frame = 0; frame < exactTimeline.length; frame++) {
      const timestamp = frame / 60;
      const targetX = exactTimeline[frame].x;
      
      // Calculate required velocity to hit target position
      let requiredVelocity = defaultVelocity;
      if (frame > 0) {
        const prevX = profile.velocityTimeline[frame - 1]?.targetX || lane.startX;
        requiredVelocity = (targetX - prevX) * fps;
      }
      
      // Apply obstacle effects (visual only - position is enforced)
      let event: VelocityEntry['event'] = 'normal';
      profile.obstacles.forEach(obs => {
        const dist = Math.abs(obs.position.x - currentX);
        if (dist < 40 && !obs.isVirtual && !obstacleEffects.has(obs.id)) {
          obstacleEffects.add(obs.id);
          event = 'obstacle';
        }
      });
      
      // Random buff visualization
      if (Math.random() < 0.001 && frame < exactTimeline.length * 0.6) {
        event = 'boost';
        profile.speedBoosts.push({
          type: 'random-buff',
          startX: currentX,
          multiplier: 1.3,
          duration: 1.5,
          animation: 'boost'
        });
      }
      
      // Use the pre-calculated exact position
      currentX = targetX;
      
      profile.velocityTimeline.push({
        timestamp,
        targetX: Math.min(currentX, lane.finishX),
        velocity: requiredVelocity,
        event
      });
    }
    
    // Ensure exact finish at finish line
    const lastEntry = profile.velocityTimeline[profile.velocityTimeline.length - 1];
    if (!lastEntry || lastEntry.targetX < lane.finishX) {
      profile.velocityTimeline.push({
        timestamp: totalFrames / fps,
        targetX: lane.finishX,
        velocity: defaultVelocity,
        event: 'normal'
      });
    }
  }
  
  // Easing function for natural movement
  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  
}
