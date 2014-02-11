package org.drugis.addis.projects.controller;

import org.drugis.addis.exception.MethodNotAllowedException;
import org.drugis.addis.trialverse.controller.Trialverse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.ArrayList;
import java.util.Collection;

/**
 * Created by daan on 2/6/14.
 */
@Controller
@RequestMapping(value="")
public class TrialverseController {

  @RequestMapping(value="/trialverse", method=RequestMethod.GET)
  @ResponseBody
  public ArrayList<Trialverse> query() throws MethodNotAllowedException {
    ArrayList<Trialverse> mockNameSpaces = new ArrayList<>();
    mockNameSpaces.add(new Trialverse(1, "aaaaaa"));
    mockNameSpaces.add(new Trialverse(2, "bbbbbb"));
    mockNameSpaces.add(new Trialverse(3, "cccccc"));
    return mockNameSpaces;
  }
}
