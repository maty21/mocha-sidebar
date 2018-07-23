

//import { SmilyButton } from '../app/components/SmilyButton';
import { expect } from 'chai';
//import { mount, shallow } from 'enzyme';

describe('Index test', function () {
    let wrapper;
 

    it('test bla', function () {
        expect('Hello world😸').to.equal('Hello world😸');
    });

    it('test fail', function() {
        expect(false).to.be.true;
    });

});