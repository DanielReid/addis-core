package org.drugis.addis.subProblem.service.impl;

import org.drugis.addis.scenarios.Scenario;
import org.drugis.addis.scenarios.repository.ScenarioRepository;
import org.drugis.addis.subProblem.SubProblem;
import org.drugis.addis.subProblem.repository.SubProblemRepository;
import org.drugis.addis.subProblem.service.SubProblemService;
import org.springframework.stereotype.Service;

import javax.inject.Inject;

/**
 * Created by joris on 8-5-17.
 */
@Service
public class SubProblemServiceImpl implements SubProblemService {
  @Inject
  SubProblemRepository subProblemRepository;

  @Inject
  ScenarioRepository scenarioRepository;

  @Override
  public void createMCDADefaults(Integer projectId, Integer analysisId, String scenarioState) {
    SubProblem subProblem = subProblemRepository.create(analysisId, "{}", "Default");
    scenarioRepository.create(analysisId, subProblem.getId(), Scenario.DEFAULT_TITLE, scenarioState);
  }
}
