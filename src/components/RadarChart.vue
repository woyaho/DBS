<template>
  <div class="radar-chart-container">
    <svg :width="size" :height="size" viewBox="0 0 200 200">
      <g :transform="`translate(${center}, ${center})`">
        <polygon
          v-for="(level, index) in levels"
          :key="'level-' + index"
          :points="getLevelPoints(level)"
          class="radar-level"
          :style="{ opacity: 0.1 + index * 0.15 }"
        />

        <line
          v-for="(dimension, index) in dimensions"
          :key="'axis-' + index"
          x1="0"
          y1="0"
          :x2="getAxisPoint(index).x"
          :y2="getAxisPoint(index).y"
          class="radar-axis"
        />

        <text
          v-for="(dimension, index) in dimensions"
          :key="'label-' + index"
          :x="getLabelPoint(index).x"
          :y="getLabelPoint(index).y"
          class="radar-label"
          :text-anchor="getLabelAnchor(index)"
        >
          {{ dimension }}
        </text>

        <polygon
          :points="getDataPoints(data)"
          class="radar-area"
        />

        <polygon
          :points="getDataPoints(data)"
          class="radar-border"
        />

        <circle
          v-for="(value, index) in data"
          :key="'point-' + index"
          :cx="getDataPoint(index).x"
          :cy="getDataPoint(index).y"
          r="4"
          class="radar-point"
        />

        <polygon
          v-if="compareData && compareData.length > 0"
          :points="getDataPoints(compareData)"
          class="radar-area compare"
        />

        <polygon
          v-if="compareData && compareData.length > 0"
          :points="getDataPoints(compareData)"
          class="radar-border compare"
        />

        <circle
          v-if="compareData && compareData.length > 0"
          v-for="(value, index) in compareData"
          :key="'compare-point-' + index"
          :cx="getDataPoint(index, compareData).x"
          :cy="getDataPoint(index, compareData).y"
          r="3"
          class="radar-point compare"
        />
      </g>
    </svg>
    
    <div v-if="showLegend && compareData && compareData.length > 0" class="radar-legend">
      <div class="legend-item">
        <span class="legend-color" style="background: #4a90e2"></span>
        <span class="legend-text">{{ legendLabels?.main || '个人得分' }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background: #ff6b6b"></span>
        <span class="legend-text">{{ legendLabels?.compare || '班级平均' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  compareData: {
    type: Array,
    default: () => []
  },
  dimensions: {
    type: Array,
    default: () => ['数据建模', 'SQL查询', '数据库设计', '事务处理', '性能优化', '安全管理']
  },
  size: {
    type: Number,
    default: 200
  },
  maxValue: {
    type: Number,
    default: 100
  },
  showLegend: {
    type: Boolean,
    default: true
  },
  legendLabels: {
    type: Object,
    default: () => ({ main: '个人得分', compare: '班级平均' })
  }
})

const center = computed(() => props.size / 2)
const radius = computed(() => props.size * 0.35)
const levels = [1, 0.8, 0.6, 0.4, 0.2]

const angleStep = computed(() => (2 * Math.PI) / props.dimensions.length)

const getAngle = (index) => {
  return (index * angleStep.value) - Math.PI / 2
}

const getLevelPoints = (level) => {
  const r = radius.value * level
  return props.dimensions.map((_, index) => {
    const angle = getAngle(index)
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')
}

const getAxisPoint = (index) => {
  const angle = getAngle(index)
  return {
    x: radius.value * Math.cos(angle),
    y: radius.value * Math.sin(angle)
  }
}

const getLabelPoint = (index) => {
  const angle = getAngle(index)
  const r = radius.value * 1.2
  return {
    x: r * Math.cos(angle),
    y: r * Math.sin(angle)
  }
}

const getLabelAnchor = (index) => {
  const angle = getAngle(index)
  const normalizedAngle = ((angle + Math.PI) % (2 * Math.PI)) - Math.PI
  if (normalizedAngle > -Math.PI / 4 && normalizedAngle < Math.PI / 4) {
    return 'start'
  } else if (normalizedAngle > Math.PI / 4 && normalizedAngle < (3 * Math.PI) / 4) {
    return 'middle'
  } else if (normalizedAngle > (3 * Math.PI) / 4 || normalizedAngle < -(3 * Math.PI) / 4) {
    return 'end'
  } else {
    return 'middle'
  }
}

const getDataPoint = (index, data = props.data) => {
  const angle = getAngle(index)
  const value = data[index] || 0
  const r = (value / props.maxValue) * radius.value
  return {
    x: r * Math.cos(angle),
    y: r * Math.sin(angle)
  }
}

const getDataPoints = (data) => {
  return data.map((_, index) => {
    const point = getDataPoint(index, data)
    return `${point.x},${point.y}`
  }).join(' ')
}
</script>

<style scoped>
.radar-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.radar-level {
  fill: #e0e0e0;
  stroke: #bdbdbd;
  stroke-width: 1;
}

.radar-axis {
  stroke: #9e9e9e;
  stroke-width: 1;
  stroke-dasharray: 4 2;
}

.radar-label {
  font-size: 12px;
  fill: #424242;
  font-weight: 500;
}

.radar-area {
  fill: rgba(74, 144, 226, 0.3);
}

.radar-area.compare {
  fill: rgba(255, 107, 107, 0.2);
}

.radar-border {
  fill: none;
  stroke: #4a90e2;
  stroke-width: 2;
}

.radar-border.compare {
  stroke: #ff6b6b;
  stroke-width: 2;
  stroke-dasharray: 4 2;
}

.radar-point {
  fill: #4a90e2;
  stroke: white;
  stroke-width: 2;
}

.radar-point.compare {
  fill: #ff6b6b;
}

.radar-legend {
  display: flex;
  gap: 20px;
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-text {
  font-size: 14px;
  color: #666;
}
</style>