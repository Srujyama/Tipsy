import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';

interface BACGaugeProps {
  bac: number;
  size?: number;
}

export default function BACGauge({bac, size = 200}: BACGaugeProps) {
  const maxBAC = 0.30;
  const percentage = Math.min(bac / maxBAC, 1);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.38;
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle;
  const currentAngle = startAngle + totalAngle * percentage;

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
    const startPoint = polarToCartesian(cx, cy, r, start);
    const endPoint = polarToCartesian(cx, cy, r, end);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return `M ${startPoint.x} ${startPoint.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`;
  };

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Svg width={size} height={size}>
        <Path
          d={describeArc(centerX, centerY, radius, startAngle, endAngle)}
          stroke="#1a1a1f"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
        {percentage > 0 && (
          <Path
            d={describeArc(centerX, centerY, radius, startAngle, currentAngle)}
            stroke="#c9a96e"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>
      <View style={styles.centerText}>
        <Text style={styles.bacValue}>{bac.toFixed(3)}</Text>
        <Text style={styles.bacLabel}>BAC %</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  bacValue: {
    fontSize: 36,
    fontWeight: '200',
    color: '#f5f0eb',
    letterSpacing: 2,
  },
  bacLabel: {
    fontSize: 10,
    color: '#555',
    fontWeight: '400',
    letterSpacing: 3,
    marginTop: 4,
  },
});
