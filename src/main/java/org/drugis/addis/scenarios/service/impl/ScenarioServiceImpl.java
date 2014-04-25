package org.drugis.addis.scenarios.service.impl;

import org.drugis.addis.analyses.Analysis;
import org.drugis.addis.analyses.repository.AnalysisRepository;
import org.drugis.addis.exception.ResourceDoesNotExistException;
import org.drugis.addis.scenarios.Scenario;
import org.drugis.addis.scenarios.service.ScenarioService;
import org.springframework.stereotype.Service;

import javax.inject.Inject;

/**
 * Created by connor on 16-4-14.
 */
@Service
public class ScenarioServiceImpl implements ScenarioService {

  @Inject
  AnalysisRepository analysisRepository;

  @Override
  public void checkCoordinates(Integer projectId, Integer analysisId, Scenario scenario) throws ResourceDoesNotExistException {
    Analysis analysis = analysisRepository.get(projectId, analysisId);

    if (!analysis.getProjectId().equals(projectId) || !analysisId.equals(scenario.getWorkspace())) {
      throw new ResourceDoesNotExistException();
    }
  }
}