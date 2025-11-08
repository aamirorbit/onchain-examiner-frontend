'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Analysis } from '@/types/analysis.types';
import { TrendingUp, AlertTriangle, CheckCircle, Info, DollarSign, Activity } from 'lucide-react';

interface AnalysisResultsProps {
  analysis: Analysis;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const { aiAnalysis, poolData, metadata } = analysis;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'High': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{aiAnalysis.liquidityHealthScore}/10</div>
              <Progress value={aiAnalysis.liquidityHealthScore * 10} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`${getRiskColor(aiAnalysis.riskLevel)} text-white text-lg px-4 py-2`}>
              {aiAnalysis.riskLevel}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Liquidity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(poolData.totalLiquidityUSD)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{aiAnalysis.summary}</p>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Key Insights
          </CardTitle>
          <CardDescription>AI-powered analysis of the token's liquidity</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {aiAnalysis.insights.map((insight, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span className="text-sm">{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Red Flags */}
      {aiAnalysis.redFlags && aiAnalysis.redFlags.length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Red Flags
            </CardTitle>
            <CardDescription>Potential concerns to be aware of</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {aiAnalysis.redFlags.map((flag, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-yellow-500 mt-1">⚠</span>
                  <span className="text-sm">{flag}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Recommendations
          </CardTitle>
          <CardDescription>What you should consider</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {aiAnalysis.recommendations.map((rec, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-blue-500 mt-1">→</span>
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Pool Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Pool Statistics</CardTitle>
          <CardDescription>Aggregated metrics from all pools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="text-xl font-semibold">{formatCurrency(poolData.totalVolumeUSD)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pool Count</p>
              <p className="text-xl font-semibold">{poolData.pairs.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-xl font-semibold">
                {poolData.aggregatedMetrics.totalTransactions.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Volume/Liquidity Ratio</p>
              <p className="text-xl font-semibold">
                {poolData.aggregatedMetrics.volumeToLiquidityRatio.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <div className="text-xs text-muted-foreground text-center">
        Analyzed at {new Date(metadata.analyzedAt).toLocaleString()} • 
        Processing time: {(metadata.processingTimeMs / 1000).toFixed(2)}s
      </div>
    </div>
  );
}

