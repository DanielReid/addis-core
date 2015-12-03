package org.drugis.addis.trialverse.service;

import net.minidev.json.JSONArray;
import net.minidev.json.parser.ParseException;
import org.apache.commons.io.IOUtils;
import org.drugis.addis.exception.ResourceDoesNotExistException;
import org.drugis.addis.trialverse.model.*;
import org.drugis.addis.trialverse.model.emun.StudyDataSection;
import org.drugis.addis.trialverse.service.impl.TriplestoreServiceImpl;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.List;

/**
 * Created by connor on 2/28/14.
 */
public interface TriplestoreService {
  String TRIPLESTORE_BASE_URI = System.getenv("TRIPLESTORE_BASE_URI");

  static String loadResource(String filename) {
    try {
      Resource myData = new ClassPathResource(filename);
      InputStream stream = myData.getInputStream();
      return IOUtils.toString(stream, "UTF-8");
    } catch (IOException e) {
      e.printStackTrace();
    }
    return "";
  }

  Collection<Namespace> queryNameSpaces() throws ParseException;

  Namespace getNamespaceHead(String uid);

  Namespace getNamespaceVersioned(String datasetUri, String versionUri);

  List<SemanticOutcome> getOutcomes(String namespaceUid, String version);

  List<SemanticIntervention> getInterventions(String namespaceUid, String version);

  List<Study> queryStudies(String namespaceUid, String version);

  List<StudyWithDetails> queryStudydetailsHead(String namespaceUid);

  StudyWithDetails getStudydetails(String namespaceUid, String studyUid) throws ResourceDoesNotExistException;

  JSONArray getStudyArms(String namespaceUid, String studyUid);

  JSONArray getStudyEpochs(String namespaceUid, String studyUid);

  List<TrialDataStudy> getTrialData(String namespaceUid, String version, String outcomeUri, List<String> interventionUris, List<String> covariateKeys);

  List<TriplestoreServiceImpl.SingleStudyBenefitRiskMeasurementRow> getSingleStudyMeasurements(String namespaceUid, String studyUid, String version, List<String> outcomeUids, List<String> interventionUids);

  List<TreatmentActivity> getStudyTreatmentActivities(String namespaceUid, String studyUid);

  List<StudyData> getStudyData(String namespaceUid, String studyUid, StudyDataSection studyDataSection);
}
