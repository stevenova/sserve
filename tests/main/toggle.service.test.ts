import assert from 'assert'
import { ToggleService, ToggleType } from '../../src/services/toggle'
import { DatabaseConnection } from '../../src/db/db'

describe('ToggleService tests', function() {
    it('should get correct field name on ToggleService#getFieldName', function() {
        const conn = new DatabaseConnection()
        const service = new ToggleService(conn)
        const fieldName = service.getFieldName('production', 'toggleTest')
        assert.equal(fieldName, 'environments.production.toggleTest')
    })

    it('should validate correct toggle type on ToggleService#validateToggle', function() {
        const conn = new DatabaseConnection()
        const service = new ToggleService(conn)
        assert.equal(service.validateToggle({ type: ToggleType.BOOLEAN, value: false }), true)
        assert.equal(service.validateToggle({ type: ToggleType.STRING, value: 'testvalue' }), true)
        assert.equal(service.validateToggle({ type: ToggleType.OBJECT, value: {} }), true)
    })

    it('should throw on validate wrong toggle type on ToggleService#validateToggle', function() {
        const conn = new DatabaseConnection()
        const service = new ToggleService(conn)
        assert.throws(() => service.validateToggle({ type: ToggleType.BOOLEAN, value: 'false' }))
        assert.throws(() => service.validateToggle({ type: ToggleType.STRING, value: {} }))
        assert.throws(() => service.validateToggle({ type: ToggleType.OBJECT, value: false }))
    })
})