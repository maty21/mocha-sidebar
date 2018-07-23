
import React from 'react';
import bla from '../../app/bla';
import { expect } from 'chai';


describe('test1', function () {

    it('its a simple one', function () {
        const a =5;
        const b = 5;
        const c =bla.try();
        console.log('asdaddsad');
       // const wrapper = shallow(<SmilyButton />);
        expect(c).to.equal('hi');
    });

    it('its a simple two', function () {
    //    const wrapper = shallow(<SmilyButton title={`Happy`} />);
        expect('😸Happy').to.equal('😸Happy');
    })
});