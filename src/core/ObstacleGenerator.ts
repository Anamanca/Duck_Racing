import type { 
  Obstacle, 
  ObstacleType, 
  Lane 
} from './types/race';

export class ObstacleGenerator {
  
  static generate(
    raceDuration: number,
    lanes: Lane[],
    _screenWidth: number,
    screenHeight: number,
    minObstaclesPerDuck: number = 5
  ): Obstacle[] {
    // Calculate total obstacles needed
    const totalObstaclesNeeded = Math.max(
      minObstaclesPerDuck * lanes.length,
      Math.floor(raceDuration / 3) * lanes.length
    );
    
    const obstacles: Obstacle[] = [];
    
    const riverStart = lanes[0].startX + 50;
    const riverEnd = lanes[0].finishX - 50;
    const riverTop = screenHeight * 0.12;
    const riverBottom = screenHeight * 0.88;
    
    // Generate obstacles evenly distributed
    const obstacleCount = Math.max(totalObstaclesNeeded, lanes.length * 5);
    
    for (let i = 0; i < obstacleCount; i++) {
      const progress = (i + 1) / (obstacleCount + 1);
      const x = riverStart + (riverEnd - riverStart) * progress;
      
      // Random Y position within river
      const y = riverTop + 50 + Math.random() * (riverBottom - riverTop - 100);
      
      const type = this.getRandomObstacleType();
      
      // For logs (cross-river), affect all lanes
      // For others, affect nearby lanes
      let affectedLaneIds: number[];
      if (type === 'log') {
        affectedLaneIds = lanes.map(l => l.id);
      } else {
        // Find lanes near this Y position
        affectedLaneIds = this.getAffectedLanes(y, lanes);
        
        // Ensure at least one lane is affected
        if (affectedLaneIds.length === 0) {
          const randomLaneIndex = Math.floor(Math.random() * lanes.length);
          affectedLaneIds = [lanes[randomLaneIndex].id];
        }
      }
      
      obstacles.push({
        id: `obs-${i}`,
        type,
        position: { x, y },
        affectsLaneIds: affectedLaneIds,
        width: this.getObstacleWidth(type),
        speedMultiplier: this.getSpeedMultiplier(type),
        effectDuration: this.getEffectDuration(type)
      });
    }
    
    // Ensure each lane has at least 5 obstacles
    lanes.forEach(lane => {
      const laneObstacles = obstacles.filter(obs => 
        obs.affectsLaneIds.includes(lane.id)
      );
      
      if (laneObstacles.length < minObstaclesPerDuck) {
        const needed = minObstaclesPerDuck - laneObstacles.length;
        for (let j = 0; j < needed; j++) {
          const progress = (j + 1) / (needed + 1);
          const x = riverStart + (riverEnd - riverStart) * (0.1 + progress * 0.8);
          const y = lane.yPosition + (Math.random() - 0.5) * 30;
          
          obstacles.push({
            id: `obs-extra-${lane.id}-${j}`,
            type: this.getRandomObstacleType(),
            position: { x, y },
            affectsLaneIds: [lane.id],
            width: 40,
            speedMultiplier: 0.7,
            effectDuration: 1.0
          });
        }
      }
    });
    
    return obstacles;
  }
  
  private static getRandomObstacleType(): ObstacleType {
    const types: ObstacleType[] = ['rock', 'log', 'whirlpool', 'branch', 'duck-collision'];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  private static getAffectedLanes(
    obstacleY: number,
    lanes: Lane[]
  ): number[] {
    const affected: number[] = [];
    
    lanes.forEach(lane => {
      const distance = Math.abs(lane.yPosition - obstacleY);
      if (distance < 50) {
        affected.push(lane.id);
      }
    });
    
    return affected;
  }
  
  private static getObstacleWidth(type: ObstacleType): number {
    switch(type) {
      case 'log': return 200;
      case 'rock': return 40;
      case 'whirlpool': return 60;
      case 'branch': return 50;
      case 'duck-collision': return 30;
      default: return 40;
    }
  }
  
  private static getSpeedMultiplier(type: ObstacleType): number {
    const reductions: Record<ObstacleType, number> = {
      'log': 0.75,
      'rock': 0.65,
      'whirlpool': 0.55,
      'branch': 0.70,
      'duck-collision': 0.85,
      'virtual-slowdown': 0.75
    };
    return reductions[type];
  }
  
  private static getEffectDuration(type: ObstacleType): number {
    switch(type) {
      case 'log': return 1.5;
      case 'rock': return 1.0;
      case 'whirlpool': return 2.0;
      case 'branch': return 1.5;
      case 'duck-collision': return 0.8;
      default: return 1.0;
    }
  }
}
