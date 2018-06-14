package org.drugis.addis.problems.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import org.drugis.addis.analyses.model.BenefitRiskNMAOutcomeInclusion;
import org.drugis.addis.interventions.model.AbstractIntervention;
import org.drugis.addis.models.Model;
import org.drugis.addis.outcomes.Outcome;
import org.drugis.addis.patavitask.PataviTask;
import org.drugis.addis.problems.model.DataSourceEntry;
import org.drugis.addis.problems.model.PerformanceTableEntryBuilder;
import org.drugis.addis.problems.service.model.AbstractMeasurementEntry;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NetworkPerformanceTableBuilder {

  public List<AbstractMeasurementEntry> build(Collection<BenefitRiskNMAOutcomeInclusion> inclusions, Map<Integer,Model> modelsById, Map<Integer,Outcome> outcomesById, Map<String,DataSourceEntry> dataSourcesByOutcomeId, Map<Integer,PataviTask> tasksByModelId, Map<URI,JsonNode> resultsByTaskUrl, Map<String,AbstractIntervention> includedInterventionsById, Map<String,AbstractIntervention> includedInterventionsByName) {
    PerformanceTableEntryBuilder entryBuilder = new PerformanceTableEntryBuilder(modelsById,
        outcomesById, dataSourcesByOutcomeId, tasksByModelId, resultsByTaskUrl, includedInterventionsById,
        includedInterventionsByName);
    return inclusions.stream()
                    .map(entryBuilder::build)
                    .collect(Collectors.toList());
  }
}
