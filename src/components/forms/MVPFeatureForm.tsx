import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MVPFeature, GrowthMetric } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormController } from '@/components/ui/form-controller';

// Update the MVPFeature interface to include originalId if it's being used
interface ExtendedMVPFeature extends MVPFeature {
  originalId?: string;
  growth_metric_id?: string | null;
}

interface MVPFeatureFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  feature?: ExtendedMVPFeature | null;
  projectId: string;
}

const MVPFeatureForm = ({ isOpen, onClose, onSave, feature, projectId }: MVPFeatureFormProps) => {
  const [featureText, setFeatureText] = useState(feature?.feature || "");
  const [priority, setPriority] = useState<"high" | "medium" | "low">(
    (feature?.priority as "high" | "medium" | "low") || "medium"
  );
  const [effort, setEffort] = useState<"high" | "medium" | "low">(
    (feature?.effort as "high" | "medium" | "low") || "medium"
  );
  const [impact, setImpact] = useState<"high" | "medium" | "low">(
    (feature?.impact as "high" | "medium" | "low") || "high"
  );
  const [status, setStatus] = useState<"planned" | "in-progress" | "completed" | "post-mvp">(
    (feature?.status as "planned" | "in-progress" | "completed" | "post-mvp") || "planned"
  );
  const [notes, setNotes] = useState(feature?.notes || "");
  const [growthMetricId, setGrowthMetricId] = useState<string | null>(feature?.growth_metric_id || null);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen && projectId) {
      fetchGrowthMetrics();
    }
  }, [isOpen, projectId]);
  
  const fetchGrowthMetrics = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('growth_metrics')
        .select('*')
        .eq('project_id', projectId);
        
      if (error) throw error;
      
      // Ensure the data conforms to the GrowthMetric type
      const typedMetrics = data?.map(metric => ({
        ...metric,
        status: (metric.status as "on-track" | "at-risk" | "off-track") || "on-track"
      })) as GrowthMetric[];
      
      setGrowthMetrics(typedMetrics || []);
    } catch (err) {
      console.error("Error fetching growth metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!featureText.trim()) {
      setError("O nome da funcionalidade é obrigatório");
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (feature) {
        // Update existing feature
        const { error } = await supabase
          .from('mvp_features')
          .update({
            feature: featureText,
            priority,
            effort,
            impact,
            status,
            notes,
            growth_metric_id: growthMetricId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', feature.originalId || feature.id);
          
        if (error) throw error;
        
        // Create or update entity dependency
        if (growthMetricId) {
          await supabase
            .from('entity_dependencies')
            .upsert({
              project_id: projectId,
              source_type: 'mvp_feature',
              source_id: feature.originalId || feature.id,
              target_type: 'growth_metric',
              target_id: growthMetricId,
              relationship_type: 'impacts',
              strength: impact === 'high' ? 3.0 : impact === 'medium' ? 2.0 : 1.0,
            }, {
              onConflict: 'source_id, target_id, relationship_type'
            });
        }
        
        toast({
          title: "Sucesso",
          description: "Funcionalidade atualizada com sucesso",
        });
      } else {
        // Create new feature
        const { data, error } = await supabase
          .from('mvp_features')
          .insert({
            feature: featureText,
            priority,
            effort,
            impact,
            status,
            notes,
            project_id: projectId,
            growth_metric_id: growthMetricId,
          })
          .select();
          
        if (error) throw error;
        
        // Create entity dependency if growth metric is selected
        if (growthMetricId && data && data.length > 0) {
          await supabase
            .from('entity_dependencies')
            .insert({
              project_id: projectId,
              source_type: 'mvp_feature',
              source_id: data[0].id,
              target_type: 'growth_metric',
              target_id: growthMetricId,
              relationship_type: 'impacts',
              strength: impact === 'high' ? 3.0 : impact === 'medium' ? 2.0 : 1.0,
            });
        }
        
        toast({
          title: "Sucesso",
          description: "Funcionalidade criada com sucesso",
        });
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error saving feature:", error);
      setError(error.message || "Ocorreu um erro ao salvar a funcionalidade");
    } finally {
      setIsSaving(false);
    }
  };

  const formTitle = feature ? "Editar Funcionalidade" : "Criar Nova Funcionalidade";
  const formDescription = "Defina as características essenciais para o seu MVP";
  
  return (
    <FormController
      isOpen={isOpen}
      onClose={onClose}
      title={formTitle}
      description={formDescription}
      isSubmitting={isSaving}
      submitLabel={feature ? "Atualizar" : "Criar"}
      onSubmit={handleSubmit}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="feature">Funcionalidade</Label>
            <Input
              id="feature"
              value={featureText}
              onChange={(e) => setFeatureText(e.target.value)}
              placeholder="Nome da Funcionalidade"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select 
              value={priority} 
              onValueChange={(value: "high" | "medium" | "low") => setPriority(value)}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="effort">Esforço</Label>
            <Select 
              value={effort} 
              onValueChange={(value: "high" | "medium" | "low") => setEffort(value)}
            >
              <SelectTrigger id="effort">
                <SelectValue placeholder="Selecione o nível de esforço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="impact">Impacto</Label>
            <Select 
              value={impact} 
              onValueChange={(value: "high" | "medium" | "low") => setImpact(value)}
            >
              <SelectTrigger id="impact">
                <SelectValue placeholder="Selecione o nível de impacto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={status} 
              onValueChange={(value: "planned" | "in-progress" | "completed" | "post-mvp") => 
                setStatus(value)
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planejado</SelectItem>
                <SelectItem value="in-progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="post-mvp">Pós-MVP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="metric">Métrica de Crescimento (Opcional)</Label>
            <Select 
              value={growthMetricId || ""} 
              onValueChange={(value) => setGrowthMetricId(value || null)}
            >
              <SelectTrigger id="metric">
                <SelectValue placeholder="Selecione uma métrica relacionada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {growthMetrics.map((metric) => (
                  <SelectItem key={metric.id} value={metric.id}>
                    {metric.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes adicionais sobre esta funcionalidade..."
              className="min-h-[100px]"
            />
          </div>
        </div>
      </form>
    </FormController>
  );
};

export default MVPFeatureForm;
